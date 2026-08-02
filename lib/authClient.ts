/**
 * Convenience wrapper for authenticated JSON API calls.
 * Prefer `authenticatedFetch` directly for multipart uploads or raw Response handling.
 * Import `joinApiUrl` from `@/lib/apiUrl` for unauthenticated requests (e.g. register).
 */
import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

export { getAccessToken } from "@/lib/authTokenStore";
export { authenticatedFetch } from "@/lib/authenticatedFetch";

function errorMessageFromResponse(
  res: Response,
  text: string,
  parsed: unknown,
): string {
  const p = parsed as { error?: unknown; message?: unknown } | null;
  if (p && typeof p.error === "string" && p.error.trim()) return p.error;
  if (p && typeof p.message === "string" && p.message.trim()) return p.message;
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed && trimmed.length < 500) return trimmed;
  return `Request failed (${res.status} ${res.statusText || ""})`.trim();
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getClientApiBaseUrl();
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const res = await authenticatedFetch(joinApiUrl(baseUrl, path), options);

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(errorMessageFromResponse(res, text, data));
  }

  if (data === null) {
    throw new Error("Empty or invalid JSON from server.");
  }

  return data as T;
}
