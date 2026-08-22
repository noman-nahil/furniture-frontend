import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";
import {
  SUGGEST_PRODUCT_LIMIT,
  SUGGEST_TIMEOUT_MS,
} from "@/lib/search/normalize";
import type {
  ProductSearchClient,
  SearchSuggestRequest,
  SearchSuggestResponse,
  SuggestErrorKind,
} from "@/lib/search/types";

export class SearchRequestError extends Error {
  kind: SuggestErrorKind;

  constructor(kind: SuggestErrorKind, message: string) {
    super(message);
    this.name = "SearchRequestError";
    this.kind = kind;
  }
}

type CacheEntry = {
  expiresAt: number;
  payload: SearchSuggestResponse;
};

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, CacheEntry>();

function getCached(key: string): SearchSuggestResponse | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.payload;
}

function setCache(key: string, payload: SearchSuggestResponse) {
  cache.set(key, { payload, expiresAt: Date.now() + CACHE_TTL_MS });
  // Bound memory — drop oldest when oversized.
  if (cache.size > 40) {
    const first = cache.keys().next().value;
    if (first != null) cache.delete(first);
  }
}

async function suggestFromMongo(
  req: SearchSuggestRequest,
): Promise<SearchSuggestResponse> {
  const q = req.query;
  const limit = req.limit || SUGGEST_PRODUCT_LIMIT;
  const cacheKey = `${q}::${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const base = getClientApiBaseUrl();
  if (!base) {
    throw new SearchRequestError("server", "Search API URL is not configured.");
  }

  const qs = new URLSearchParams({
    search: q,
    page: "1",
    limit: String(limit),
    includeTotal: "false",
  });
  const url = joinApiUrl(base, `/products?${qs.toString()}`);

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    SUGGEST_TIMEOUT_MS,
  );

  const onAbort = () => timeoutController.abort();
  req.signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url, {
      signal: timeoutController.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new SearchRequestError(
        "server",
        `Search failed (${res.status}).`,
      );
    }

    const json = (await res.json()) as { data?: SearchSuggestResponse["products"] };
    const products = Array.isArray(json.data) ? json.data : [];
    const payload = { products };
    setCache(cacheKey, payload);
    return payload;
  } catch (err) {
    if (err instanceof SearchRequestError) throw err;
    if ((err as Error)?.name === "AbortError") {
      if (req.signal?.aborted) throw err;
      throw new SearchRequestError("timeout", "Search timed out. Try again.");
    }
    throw new SearchRequestError(
      "network",
      "Unable to reach search. Check your connection.",
    );
  } finally {
    clearTimeout(timeoutId);
    req.signal?.removeEventListener("abort", onAbort);
  }
}

/** Default client — swap for Typesense/ES later without touching UI hooks. */
export const mongoSearchClient: ProductSearchClient = {
  suggest: suggestFromMongo,
};

export function clearSuggestCache() {
  cache.clear();
}
