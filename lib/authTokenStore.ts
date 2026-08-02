/**
 * Module-level access token bridge for non-React code (apiFetch, lib/order, etc.).
 * AuthContext is the sole writer; api modules read synchronously.
 */

let accessToken: string | null = null;
let refreshAccessTokenFn: (() => Promise<string | null>) | null = null;
let sessionExpiredFn: ((reason: string) => Promise<void>) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return accessToken;
}

/** Called once from AuthProvider — delegates refresh to AuthContext.doRefresh. */
export function registerRefreshAccessToken(
  fn: () => Promise<string | null>,
): void {
  refreshAccessTokenFn = fn;
}

/** Returns true when AuthContext refresh produced a new access token. */
export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshAccessTokenFn) return false;
  const token = await refreshAccessTokenFn();
  return token !== null;
}

/** Called from AuthProvider — redirects to login when refresh fails after 401. */
export function registerSessionExpiredHandler(
  fn: (reason: string) => Promise<void>,
): void {
  sessionExpiredFn = fn;
}

export async function notifySessionExpired(reason: string): Promise<void> {
  if (!sessionExpiredFn) return;
  try {
    await sessionExpiredFn(reason);
  } catch {
    // ignore
  }
}

/** Remove legacy localStorage token from pre-migration sessions. */
export function clearLegacyAccessTokenStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("accessToken");
  } catch {
    // ignore
  }
}
