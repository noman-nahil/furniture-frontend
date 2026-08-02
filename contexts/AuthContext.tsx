/**
 * contexts/AuthContext.tsx — Production Auth Context
 * ────────────────────────────────────────────────────
 * Responsibilities:
 *  • Hold user state (in memory — never localStorage)
 *  • On mount: attempt silent /auth/refresh to restore session after page reload
 *  • Expose a typed fetchWithAuth() that auto-refreshes on 401 (once per request)
 *  • Schedule a proactive token refresh before accessToken expires
 *  • Expose login(), logout(), user, isLoading, isReady, isLoggedIn
 *
 * Token storage:
 *  accessToken  → in-memory (AuthContext ref + authTokenStore for apiFetch)
 *                 + non-httpOnly cookie for middleware.ts
 *  refreshToken → httpOnly cookie managed entirely by the backend (never touched here).
 *
 * Why a cookie for the accessToken too?
 *  Next.js middleware runs in the Edge runtime and cannot read JS memory.
 *  We set a non-httpOnly "accessToken" cookie (same maxAge as the JWT exp)
 *  so middleware can decode it for routing decisions.  It is still short-lived
 *  (≤15 min) so the XSS exposure window is minimal.  The actual API calls
 *  use the in-memory value via the Authorization header.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type AuthUser,
  parseAuthUserFromApiResponse,
} from "@/lib/authUser";
import {
  clearLegacyAccessTokenStorage,
  registerRefreshAccessToken,
  registerSessionExpiredHandler,
  setAccessToken as syncAccessTokenToStore,
} from "@/lib/authTokenStore";
import { getClientApiBaseUrl } from "@/lib/apiUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

export type { AuthUser } from "@/lib/authUser";

interface AuthContextValue {
  user:           AuthUser | null;
  isLoading:      boolean;
  /** Session bootstrap finished (success or failure). */
  isReady:        boolean;
  /** Authenticated user present in context. */
  isLoggedIn:     boolean;
  /** Call after a successful login response. */
  login:          (user: AuthUser, accessToken: string) => void;
  logout:         (reason?: string) => Promise<void>;
  /**
   * Drop-in replacement for fetch() on authenticated endpoints.
   * Automatically adds Authorization header and retries once after a 401
   * by refreshing the token pair before giving up.
   */
  fetchWithAuth:  (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse the exp claim from a raw JWT without verifying the signature. */
function getTokenExpMs(token: string): number | null {
  try {
    const base64  = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Set a short-lived non-httpOnly cookie so Next.js Edge middleware can read
 * the accessToken for routing decisions without a backend round-trip.
 */
function setAccessTokenCookie(token: string) {
  const expMs  = getTokenExpMs(token);
  const maxAge = expMs ? Math.floor((expMs - Date.now()) / 1000) : 900; // default 15 min
  // SameSite=Lax prevents cross-site requests; Secure is set by the browser on HTTPS
  document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax${
    location.protocol === "https:" ? "; Secure" : ""
  }`;
}

function clearAccessTokenCookie() {
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  // In-memory token — never written to localStorage
  const accessTokenRef  = useRef<string | null>(null);
  // Promise shared across concurrent 401 retries so we only refresh once
  const refreshPromise  = useRef<Promise<string | null> | null>(null);
  // Timer id for the proactive refresh schedule
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Proactive refresh scheduler ─────────────────────────────────────────

  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const expMs = getTokenExpMs(token);
    if (!expMs) return;

    // Refresh 60 seconds before expiry
    const delay = expMs - Date.now() - 60_000;
    if (delay <= 0) return; // already close to expiry — let the 401 handler deal with it

    refreshTimerRef.current = setTimeout(async () => {
      await doRefresh();
    }, delay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core refresh logic ──────────────────────────────────────────────────

  /** Calls /auth/refresh and updates in-memory token + cookie. Returns new token or null. */
  const doRefresh = useCallback((): Promise<string | null> => {
    // Deduplicate: if a refresh is already in flight, share the same promise
    if (refreshPromise.current) return refreshPromise.current;

    refreshPromise.current = (async () => {
      try {
        const res = await fetch(`${getClientApiBaseUrl()}/auth/refresh`, {
          method:      "POST",
          credentials: "include", // sends httpOnly refreshToken cookie
        });

        if (!res.ok) return null;

        const data = await res.json() as { accessToken?: string };
        const newToken = data?.accessToken ?? null;

        if (newToken) {
          accessTokenRef.current = newToken;
          syncAccessTokenToStore(newToken);
          setAccessTokenCookie(newToken);
          scheduleRefresh(newToken);
        }

        return newToken;
      } catch {
        return null;
      } finally {
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, [scheduleRefresh]);

  // ── Silent session restore on mount ─────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        // Attempt to get a fresh accessToken using the httpOnly refreshToken cookie.
        // If the cookie is gone (logged out / expired), this will 401 and we stay logged out.
        const newToken = await doRefresh();

        if (cancelled) return;

        if (!newToken) {
          setLoading(false);
          return;
        }

        // Fetch the current user profile with the new token
        const meRes = await fetch(`${getClientApiBaseUrl()}/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
          credentials: "include",
        });

        if (cancelled) return;

        if (meRes.ok) {
          const body = await meRes.json();
          const authUser = parseAuthUserFromApiResponse(body);
          if (authUser) {
            setUser(authUser);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public API ────────────────────────────────────────────────────────────

  const login = useCallback((authUser: AuthUser, accessToken: string) => {
    accessTokenRef.current = accessToken;
    syncAccessTokenToStore(accessToken);
    setAccessTokenCookie(accessToken);
    scheduleRefresh(accessToken);
    setUser(authUser);
  }, [scheduleRefresh]);

  const logout = useCallback(async (reason?: string) => {
    // Best-effort server-side revocation
    try {
      await fetch(`${getClientApiBaseUrl()}/auth/logout`, {
        method:      "POST",
        credentials: "include",
      });
    } catch { /* ignore network errors on logout */ }

    // Clear local state
    accessTokenRef.current = null;
    syncAccessTokenToStore(null);
    clearAccessTokenCookie();
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setUser(null);

    const url = new URL("/login", window.location.href);
    if (reason) url.searchParams.set("reason", reason);
    window.location.replace(url.toString());
  }, []);

  // ── Bridge for apiFetch / non-React modules ─────────────────────────────

  useEffect(() => {
    registerRefreshAccessToken(doRefresh);
    registerSessionExpiredHandler((reason) => logout(reason));
    clearLegacyAccessTokenStorage();
  }, [doRefresh, logout]);

  /**
   * Authenticated fetch with automatic 401 → refresh → retry.
   * Delegates to lib/authenticatedFetch (shared with apiFetch).
   */
  const fetchWithAuth = useCallback(
    (input: RequestInfo, init: RequestInit = {}) =>
      authenticatedFetch(input, init),
    [],
  );

  const isReady = !isLoading;
  const isLoggedIn = user !== null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isReady,
      isLoggedIn,
      login,
      logout,
      fetchWithAuth,
    }),
    [user, isLoading, isReady, isLoggedIn, login, logout, fetchWithAuth],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}