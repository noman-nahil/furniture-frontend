import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import { MAINTENANCE_PATH, isMaintenanceModeEnabled } from "@/lib/maintenance";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const ROLE_ROUTES: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  customer: "/dashboard",
};

const KNOWN_ROLES = new Set(Object.keys(ROLE_ROUTES));

const ALLOWED_RETURN_PREFIXES = ["/admin", "/manager", "/dashboard", "/products", "/checkout", "/cart", "/account"];

// Routes where the session decides the outcome: the single login page and the
// three role areas. Everything else the matcher lets through is public
// storefront, which middleware only inspects for maintenance mode.
const SESSION_ROUTE_PREFIXES = ["/login", "/admin", "/manager", "/dashboard"];

// Staff keep browsing the storefront while it is closed so they can verify the
// site before switching maintenance back off.
const MAINTENANCE_EXEMPT_ROLES = new Set(["admin", "manager"]);

function isSafeReturnTo(url: string): boolean {
  try {
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
      return false;
    }
    return ALLOWED_RETURN_PREFIXES.some((prefix) => url.startsWith(prefix));
  } catch {
    return false;
  }
}

function resolveRoleRoute(role: string | undefined): string | null {
  if (!role || !KNOWN_ROLES.has(role)) return null;
  return ROLE_ROUTES[role];
}

function isSessionRoute(pathname: string): boolean {
  return SESSION_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// ─────────────────────────────────────────────
// Session type (JWT access-token payload)
// ─────────────────────────────────────────────

type SessionUser = {
  sub: string;
  role: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
};

type SessionResult =
  | { status: "guest" }
  | { status: "active"; user: SessionUser }
  | { status: "invalid"; reason: string };

/** Single source of truth for reading the access-token cookie. */
async function readSession(req: NextRequest): Promise<SessionResult> {
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return { status: "guest" };
  }

  if (!process.env.JWT_SECRET) {
    console.error("[middleware] JWT_SECRET is not set");
    return { status: "invalid", reason: "auth_error" };
  }

  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    return { status: "invalid", reason: "session_expired" };
  }

  return {
    status: "active",
    user: {
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
      name: payload.name,
      iat: payload.iat,
      exp: payload.exp,
    },
  };
}

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

/**
 * WordPress leftovers. next.config redirects never run for these because
 * middleware matches the path first and returns next() — then `/{sectionSlug}`
 * 404s. Handle them here, before the maintenance gate.
 */
function applyLegacyRedirect(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  if (pathname !== "/shop" && !pathname.startsWith("/shop/")) return null;

  const url = req.nextUrl.clone();
  url.pathname = "/products";
  return NextResponse.redirect(url, 308);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const legacy = applyLegacyRedirect(req);
  if (legacy) return legacy;

  // Public storefront. Maintenance mode is the only reason middleware runs
  // here, and while it is off the request is handed straight back to Next
  // without ever touching the session.
  if (!isSessionRoute(pathname)) {
    return maintenanceGate(req);
  }

  const session = await readSession(req);

  if (session.status === "invalid") {
    return logoutAndRedirect(req, session.reason);
  }

  const user = session.status === "active" ? session.user : null;

  // ── Maintenance mode → customers have nowhere to go ────────────────────
  // Neither their dashboard nor the login page they just submitted, so the
  // notice is the destination regardless of which route they asked for.
  if (user?.role === "customer" && (await isMaintenanceModeEnabled())) {
    return NextResponse.redirect(new URL(MAINTENANCE_PATH, req.url));
  }

  // ── Already logged in → redirect away from /login ─────────────────────
  if (pathname === "/login" && user) {
    const destination = resolveRoleRoute(user.role);

    if (!destination) {
      console.error(`[middleware] Unrecognized role "${user.role}" for user ${user.sub}`);
      return logoutAndRedirect(req, "auth_error");
    }

    return NextResponse.redirect(new URL(destination, req.url));
  }

  // ── Not logged in → force login ────────────────────────────────────────
  if (!user && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("reason", "required");

    const returnTo = req.nextUrl.pathname + req.nextUrl.search;
    if (isSafeReturnTo(returnTo)) {
      loginUrl.searchParams.set("returnTo", returnTo);
    }

    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based access control ──────────────────────────────────────────
  if (user) {
    const role = user.role;
    const isAdminRoute   = pathname.startsWith("/admin");
    const isManagerRoute = pathname.startsWith("/manager");
    const isDashRoute    = pathname.startsWith("/dashboard");

    const denied =
      (isAdminRoute   && role !== "admin") ||
      (isManagerRoute && role !== "manager") ||
      (isDashRoute    && role !== "customer");

    if (denied) {
      const destination = resolveRoleRoute(role);

      if (!destination) {
        console.error(`[middleware] Unrecognized role "${role}" for user ${user.sub}`);
        return logoutAndRedirect(req, "auth_error");
      }

      return NextResponse.redirect(new URL(destination, req.url));
    }
  }

  return NextResponse.next();
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Gate for every public storefront route. Guests and customers are sent to
 * the maintenance notice; admins and managers pass through untouched.
 */
async function maintenanceGate(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const maintenanceMode = await isMaintenanceModeEnabled();

  if (pathname === MAINTENANCE_PATH) {
    // The notice has nothing to say once the storefront is back online.
    return maintenanceMode
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/", req.url));
  }

  if (!maintenanceMode) {
    return NextResponse.next();
  }

  const session = await readSession(req);

  if (
    session.status === "active" &&
    MAINTENANCE_EXEMPT_ROLES.has(session.user.role)
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(MAINTENANCE_PATH, req.url));
}

function logoutAndRedirect(req: NextRequest, reason: string) {
  const url = new URL("/login", req.url);
  url.searchParams.set("reason", reason);

  const response = NextResponse.redirect(url);
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}

// ─────────────────────────────────────────────
// Matcher
// ─────────────────────────────────────────────

export const config = {
  // Maintenance mode has to cover the whole storefront, so the matcher is now
  // "everything except" instead of a list of role areas: Next.js internals,
  // API routes and files served from /public (any last segment with a file
  // extension) never reach middleware.
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)"],
};
