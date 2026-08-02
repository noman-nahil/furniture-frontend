/**
 * Shared authenticated fetch for AuthContext.fetchWithAuth and apiFetch.
 * Uses authTokenStore for token read + refresh delegation to AuthContext.
 */

import {
  getAccessToken,
  notifySessionExpired,
  refreshAccessToken,
} from "@/lib/authTokenStore";

function buildAuthHeaders(init: RequestInit = {}): Headers {
  const headers = new Headers(init.headers ?? undefined);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

/**
 * fetch with Bearer token, credentials, and one 401 → refresh → retry cycle.
 */
export async function authenticatedFetch(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  const credentials = init.credentials ?? "include";

  const firstRes = await fetch(input, {
    ...init,
    headers: buildAuthHeaders(init),
    credentials,
  });

  if (firstRes.status !== 401) {
    return firstRes;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    void notifySessionExpired("session_expired");
    return firstRes;
  }

  const retryHeaders = new Headers(init.headers ?? undefined);
  const token = getAccessToken();

  if (token) {
    retryHeaders.set("Authorization", `Bearer ${token}`);
  }

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!retryHeaders.has("Content-Type") && !isFormData) {
    retryHeaders.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers: retryHeaders,
    credentials,
  });
}
