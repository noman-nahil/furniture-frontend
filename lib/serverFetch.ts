/**
 * serverFetch — hardened server-side fetch wrapper for Next.js App Router.
 *
 * Changelog vs. previous version (see audit for full findings):
 *  - C1: response size limit is now enforced by reading the stream and
 *    counting bytes as they arrive, not just by trusting Content-Length.
 *    Content-Length is still checked first as a fast-path short-circuit.
 *  - H1/M2: ServerFetchResult no longer fakes a `{ data: [] }` shape on
 *    failure. The failure branch is now discriminated on a unique,
 *    collision-resistant key (`__serverFetchError`) instead of `error`,
 *    which could collide with a legitimate field on T.
 *  - H2: server-only calls now prefer a private env var over
 *    NEXT_PUBLIC_API_URL. FLAGGED ASSUMPTION — see comment below.
 *  - H3: Content-Type check now matches any JSON media type (including
 *    e.g. "application/problem+json"), not just an exact substring.
 *  - H4: a missing base URL is now reported as "config_error", distinct
 *    from a genuine network failure.
 *  - H5: on non-2xx responses, the body is now parsed (bounded by the
 *    same size limit) and surfaced as `message`, instead of being
 *    discarded. FLAGGED ASSUMPTION — see comment below.
 *  - M4: fail() no longer needs an unsafe `as` cast.
 *  - M5: callers can pass their own AbortSignal, merged with the
 *    internal timeout.
 *  - M6: errors are logged as structured objects instead of ad hoc
 *    template strings, to make them easier to grep / ship to a log
 *    aggregator later.
 *  - L1: `revalidate` is validated (must be a finite, non-negative
 *    number) instead of being passed through unchecked.
 *  - L3: 204/205 (No Content) responses are treated as an explicit
 *    success case instead of falling into parse_error.
 *
 * ⚠️ BREAKING CHANGE for existing callers:
 *   Previously, `isServerFetchError(res)` narrowed to
 *   `{ data: []; error: true; errorType?: ServerFetchError }`, and some
 *   callers may have relied on `res.data` being `[]` on failure without
 *   calling the guard first. That fallback data is gone — callers must
 *   branch on `isServerFetchError(res)` before touching the payload.
 *   This matches how the codebase already needs to work for
 *   non-list endpoints (e.g. getProductById, createProduct), where a
 *   `{ data: [] }` fallback never made sense in the first place.
 */

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * 5MB hard ceiling — prevents the ArrayBuffer allocation crash on large
 * responses (e.g. the admin product listing, which currently returns an
 * unfiltered projection for up to 500 products). Enforced by streaming,
 * not just by trusting Content-Length (see readBodyWithLimit).
 */
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** Reason the fetch failed — use in UI to show specific error messages. */
export type ServerFetchError =
  | "network" // DNS failure, ECONNREFUSED, no internet
  | "timeout" // Took longer than timeoutMs
  | "server_error" // Backend returned 5xx
  | "client_error" // Backend returned 4xx (bad request, not found, etc.)
  | "parse_error" // Response wasn't valid JSON
  | "too_large" // Response exceeded maxBytes
  | "config_error"; // NEXT_PUBLIC_API_URL (or equivalent) is not set

/**
 * Discriminated failure shape. Deliberately does NOT try to mimic any
 * particular success shape (no fake `data: []`) — callers must check
 * `isServerFetchError` before touching the payload.
 */
export type ServerFetchFailure = {
  /** Unique discriminant key, chosen to avoid colliding with real API fields. */
  __serverFetchError: true;
  errorType: ServerFetchError;
  /**
   * Human-readable message extracted from the backend's error body, when
   * available. FLAGGED ASSUMPTION: this assumes the backend's error
   * middleware returns JSON shaped like `{ error: string }` or
   * `{ message: string }` (both are checked). Confirmed for the two
   * manual 404s in productController (`{ error: "Not found" }` /
   * `{ error: "Product not found" }`); NOT yet confirmed for errors
   * thrown as HttpError and caught by global middleware, since that
   * middleware wasn't available to inspect. Verify before relying on
   * this in the UI for anything user-facing beyond a fallback string.
   */
  message?: string;
  /** HTTP status code, when the failure came from a response (not network/timeout). */
  status?: number;
};

export type ServerFetchResult<T> = T | ServerFetchFailure;

/** Type guard: true when the fetch failed, so you can show a friendly message. */
export function isServerFetchError<T>(
  res: ServerFetchResult<T>,
): res is ServerFetchFailure {
  return (
    res != null &&
    typeof res === "object" &&
    (res as { __serverFetchError?: unknown }).__serverFetchError === true
  );
}

// ─────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────

export type ServerFetchOptions = {
  /** Request timeout in ms. Default: 10_000 */
  timeoutMs?: number;

  /**
   * ISR revalidation in seconds. Omit to use no-store (always fresh).
   * Usage: serverFetch('/products', { revalidate: 60 })
   */
  revalidate?: number;

  /** Max allowed response size in bytes. Default: 5MB */
  maxBytes?: number;

  /**
   * Optional caller-supplied abort signal (e.g. tied to a request
   * lifecycle). Merged with the internal timeout — whichever fires
   * first wins.
   */
  signal?: AbortSignal;
};

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

function fail(
  errorType: ServerFetchError,
  extra?: { message?: string; status?: number },
): ServerFetchFailure {
  return {
    __serverFetchError: true,
    errorType,
    ...(extra?.message !== undefined ? { message: extra.message } : {}),
    ...(extra?.status !== undefined ? { status: extra.status } : {}),
  };
}

function logFetchError(
  path: string,
  errorType: ServerFetchError,
  detail: Record<string, unknown> = {},
): void {
  // Structured, single-line-friendly shape so this is easy to grep and
  // easy to swap for a real logger/error-tracking integration later.
  console.error({
    scope: "serverFetch",
    path,
    errorType,
    ...detail,
  });
}

/**
 * Reads a Response body up to `maxBytes`, aborting the stream early if
 * the limit is exceeded. This is the actual size guard — the
 * Content-Length check in `serverFetch` is only a fast-path
 * short-circuit for the (common but not guaranteed) case where the
 * header is present and honest. Chunked responses, or a backend that
 * misreports Content-Length, are still caught here.
 */
async function readBodyWithLimit(
  res: Response,
  maxBytes: number,
): Promise<{ tooLarge: true } | { tooLarge: false; text: string }> {
  if (!res.body) {
    // No streaming body available in this runtime — fall back to text()
    // directly. This is a narrower guarantee than the streaming path,
    // but is the best available without a readable stream.
    const text = await res.text();
    if (text.length > maxBytes) {
      return { tooLarge: true };
    }
    return { tooLarge: false, text };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let received = 0;
  let out = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => {});
        return { tooLarge: true };
      }
      out += decoder.decode(value, { stream: true });
    }
  }
  out += decoder.decode();

  return { tooLarge: false, text: out };
}

/** Loose match for any JSON media type, including e.g. `application/problem+json`. */
function isJsonContentType(contentType: string): boolean {
  return /json/i.test(contentType);
}

// ─────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────

export async function serverFetch<T = unknown>(
  path: string,
  options?: ServerFetchOptions,
): Promise<ServerFetchResult<T>> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options?.maxBytes ?? MAX_RESPONSE_BYTES;

  const controller = new AbortController();
  const startedAt = Date.now();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // Merge an optional external signal with the internal timeout signal.
  const externalSignal = options?.signal;
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }

  try {
    // FLAGGED ASSUMPTION: this still reads NEXT_PUBLIC_API_URL as the
    // primary source. A private, server-only var (e.g. API_INTERNAL_URL)
    // is preferred when set, since NEXT_PUBLIC_* is inlined into the
    // client bundle and this function is server-only. Verify the actual
    // env var names in use (.env / next.config.js) before relying on
    // API_INTERNAL_URL being populated — if it isn't set anywhere yet,
    // this silently falls back to today's behavior.
    const baseUrl =
      process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

    if (!baseUrl) {
      logFetchError(path, "config_error", {
        reason: "API_INTERNAL_URL and NEXT_PUBLIC_API_URL are both unset",
      });
      return fail("config_error", {
        message: "API base URL is not configured.",
      });
    }

    const url = `${baseUrl}${path}`;

    let nextCache: RequestInit["next"] | undefined;
    if (options?.revalidate != null) {
      const revalidate = options.revalidate;
      if (!Number.isFinite(revalidate) || revalidate < 0) {
        logFetchError(path, "config_error", {
          reason: "invalid revalidate value",
          revalidate,
        });
        // Fall back to no-store rather than passing a bad value to Next.js.
        nextCache = undefined;
      } else {
        nextCache = { revalidate };
      }
    }

    const res = await fetch(url, {
      cache: nextCache ? "force-cache" : "no-store",
      next: nextCache,
      signal: controller.signal,
    });

    // Fast-path short-circuit: if Content-Length is present and already
    // over the limit, bail before reading anything. Not a full guarantee
    // (see readBodyWithLimit for the real guard).
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      logFetchError(path, "too_large", {
        contentLength,
        maxBytes,
        source: "content-length header",
      });
      return fail("too_large", { status: res.status });
    }

    // 204/205 have no body by definition — treat as success rather than
    // routing through JSON parsing (which would throw on an empty body).
    if (res.status === 204 || res.status === 205) {
      if (!res.ok) {
        return fail(res.status >= 500 ? "server_error" : "client_error", {
          status: res.status,
        });
      }
      // No content to parse. Callers requesting a body-bearing T from an
      // endpoint that can return 204 should treat this case explicitly.
      return undefined as T;
    }

    const bodyResult = await readBodyWithLimit(res, maxBytes);
    if (bodyResult.tooLarge) {
      logFetchError(path, "too_large", {
        maxBytes,
        source: "stream byte count",
      });
      return fail("too_large", { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "";

    if (!res.ok) {
      const errorType: ServerFetchError =
        res.status >= 500 ? "server_error" : "client_error";

      // Best-effort extraction of a backend error message. See the
      // FLAGGED ASSUMPTION on ServerFetchFailure.message re: field name.
      let message: string | undefined;
      if (isJsonContentType(contentType)) {
        try {
          const parsed = JSON.parse(bodyResult.text) as {
            error?: unknown;
            message?: unknown;
          };
          if (typeof parsed.error === "string") message = parsed.error;
          else if (typeof parsed.message === "string") message = parsed.message;
        } catch {
          // Body claimed to be JSON but wasn't parseable — fall through
          // with no message rather than throwing here.
        }
      }

      // 404 means the resource is missing — callers map that to notFound().
      // Logging it as console.error makes Next.js treat unknown URLs as
      // overlay-worthy server errors.
      if (res.status !== 404) {
        logFetchError(path, errorType, { status: res.status, message });
      }
      return fail(errorType, { status: res.status, message });
    }

    if (!isJsonContentType(contentType)) {
      logFetchError(path, "parse_error", {
        reason: "unexpected content-type",
        contentType,
      });
      return fail("parse_error", {
        status: res.status,
        message: `Expected JSON but got "${contentType}".`,
      });
    }

    try {
      return JSON.parse(bodyResult.text) as T;
    } catch {
      logFetchError(path, "parse_error", { reason: "JSON.parse failed" });
      return fail("parse_error", { status: res.status });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      logFetchError(path, "timeout", {
        durationMs: Date.now() - startedAt,
        timeoutMs,
        reason: timedOut ? "timeout" : "aborted",
      });
      return fail("timeout");
    }
    logFetchError(path, "network", {
      reason: err instanceof Error ? err.message : String(err),
    });
    return fail("network");
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}