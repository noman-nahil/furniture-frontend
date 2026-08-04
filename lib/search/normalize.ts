/** Max query length — ReDoS / cache-key protection. */
export const MAX_SEARCH_LENGTH = 200;

/** Minimum length before suggestions / auto-refine fire. */
export const MIN_SEARCH_LENGTH = 2;

/** Debounce before refining results while already on /products. */
export const SEARCH_DEBOUNCE_MS = 400;

/** Debounce before fetching suggestions. */
export const SUGGEST_DEBOUNCE_MS = 280;

/** Suggest fetch timeout (ms). */
export const SUGGEST_TIMEOUT_MS = 8_000;

export const SUGGEST_PRODUCT_LIMIT = 6;
export const SUGGEST_CATEGORY_LIMIT = 3;
export const SUGGEST_SUBCATEGORY_LIMIT = 3;

/**
 * Trim, collapse internal whitespace, and cap length.
 * Safe with untrusted input — always returns a string.
 */
export function normalizeSearch(raw: unknown): string {
  const str = typeof raw === "string" ? raw : "";
  return str.replace(/\s+/g, " ").trim().slice(0, MAX_SEARCH_LENGTH);
}

/** True when a normalized query is long enough to search. */
export function isSearchableQuery(
  normalized: string,
  minLength: number = MIN_SEARCH_LENGTH,
): boolean {
  return normalized.length >= minLength;
}

/** Cap raw input while typing (keeps mid-edit spaces). */
export function clampSearchInput(raw: string): string {
  return raw.slice(0, MAX_SEARCH_LENGTH);
}

/** Build the catalog results href for a normalized query. */
export function buildSearchResultsHref(normalizedQuery: string): string {
  if (!normalizedQuery) return "/products";
  return `/products?search=${encodeURIComponent(normalizedQuery)}`;
}
