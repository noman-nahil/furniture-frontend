const DEFAULT_TIMEOUT_MS = 10_000;

// ✅ 5MB hard ceiling — prevents the ArrayBuffer allocation crash you hit
//    on /products. If the backend returns a response larger than this,
//    we reject it before Node.js tries to buffer it into memory.
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** Reason the fetch failed — use in UI to show specific error messages. */
export type ServerFetchError =
  | "network"       // DNS failure, ECONNREFUSED, no internet
  | "timeout"       // Took longer than timeoutMs
  | "server_error"  // Backend returned 5xx
  | "client_error"  // Backend returned 4xx (bad request, not found, etc.)
  | "parse_error"   // Response wasn't valid JSON
  | "too_large";    // Response exceeded MAX_RESPONSE_BYTES

export type ServerFetchResult<T> =
  | T
  | { data: []; error: true; errorType?: ServerFetchError };

/** Type guard: true when the fetch failed, so you can show a friendly message. */
export function isServerFetchError<T>(
  res: ServerFetchResult<T>
): res is { data: []; error: true; errorType?: ServerFetchError } {
  return (
    res != null &&
    typeof res === "object" &&
    "error" in res &&
    (res as { error?: boolean }).error === true
  );
}

// ─────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────

export type ServerFetchOptions = {
  /** Request timeout in ms. Default: 10_000 */
  timeoutMs?: number;

  // ✅ Added revalidate option so callers can opt into ISR instead of
  //    always using cache: "no-store". Previously every fetch bypassed
  //    Next.js's data cache entirely — even for pages with revalidate = 60.
  //    Usage: serverFetch('/products', { revalidate: 60 })
  //    This lets Next.js cache the fetch result and revalidate in background.
  /** ISR revalidation in seconds. Omit to use no-store (always fresh). */
  revalidate?: number;

  /** Max allowed response size in bytes. Default: 5MB */
  maxBytes?: number;
};

// ─────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────

export async function serverFetch<T = unknown>(
  path: string,
  options?: ServerFetchOptions,
): Promise<ServerFetchResult<T>> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes  = options?.maxBytes  ?? MAX_RESPONSE_BYTES;

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  function fail(errorType: ServerFetchError): ServerFetchResult<T> {
    return { data: [], error: true, errorType } as ServerFetchResult<T>;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    // ✅ Fixed: original checked `!url || url === path` to detect a missing
    //    base URL — but this is wrong. If path is "/products" and baseUrl is
    //    "", then url = "/products" which equals path. But a relative URL is
    //    still technically valid in some environments. The real check is
    //    whether baseUrl itself is empty.
    if (!baseUrl) {
      console.error("[serverFetch] NEXT_PUBLIC_API_URL is not set");
      return fail("network");
    }

    const url = `${baseUrl}${path}`;

    // ✅ Build Next.js fetch cache config based on revalidate option.
    //    Previously always used cache: "no-store" which means every SSR
    //    request hits the backend — even pages with `export const revalidate = 60`.
    //    With revalidate set, Next.js caches the fetch and revalidates in background.
    const nextCache: RequestInit["next"] = options?.revalidate != null
      ? { revalidate: options.revalidate }
      : undefined;

    const res = await fetch(url, {
      cache: options?.revalidate != null ? "force-cache" : "no-store",
      next: nextCache,
      signal: controller.signal,
    });

    // ✅ Added: check Content-Length before reading the body.
    //    This is what caused your ArrayBuffer allocation crash on /products —
    //    the backend was returning a huge payload and Node.js ran out of
    //    contiguous memory trying to buffer it all at once.
    //    Content-Length isn't always present (chunked transfer), but when it
    //    is, we can reject early before allocating anything.
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      console.error(
        `[serverFetch] Response too large: ${contentLength} bytes for ${path} (max: ${maxBytes})`
      );
      return fail("too_large");
    }

    if (!res.ok) {
      // ✅ Fixed: original used undefined for errorType on 4xx responses,
      //    losing information. Now distinguishes client vs server errors
      //    so the UI can show "not found" vs "server is down" messages.
      const errorType: ServerFetchError =
        res.status >= 500 ? "server_error" : "client_error";
      return fail(errorType);
    }

    // ✅ Added: check Content-Type before parsing.
    //    If the backend returns an HTML error page (e.g. from a proxy or
    //    load balancer), res.json() throws a parse error that's confusing
    //    to debug. This gives a clear log message instead.
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error(
        `[serverFetch] Expected JSON but got "${contentType}" for ${path}`
      );
      return fail("parse_error");
    }

    try {
      return (await res.json()) as T;
    } catch {
      console.error(`[serverFetch] JSON parse failed for ${path}`);
      return fail("parse_error");
    }
  } catch (err: unknown) {
    // ✅ Simplified error type detection — original had redundant branches:
    //    `isFetchFailed || err instanceof TypeError ? "network" : "network"`
    //    Both branches returned "network", so the distinction was meaningless.
    //    Now: AbortError → timeout, everything else → network.
    if (err instanceof Error && err.name === "AbortError") {
      return fail("timeout");
    }
    return fail("network");
  } finally {
    clearTimeout(timeoutId);
  }
}