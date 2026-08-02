import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/verifyAccessToken";

export interface ServerUser {
  name: string;
  email: string;
  role: string;
  dashboardRoute: string;
}

const ROLE_ROUTES: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  customer: "/dashboard",
};

function getDashboardRoute(role?: string): string {
  return ROLE_ROUTES[role ?? ""] ?? "/dashboard";
}

/**
 * Resolve the current user in Server Components from the accessToken cookie.
 * Uses local JWT verification (same as middleware) — no backend round-trip.
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return null;

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return null;

    return {
      name: payload.name ?? "",
      email: payload.email ?? "",
      role: payload.role,
      dashboardRoute: getDashboardRoute(payload.role),
    };
  } catch {
    return null;
  }
}
