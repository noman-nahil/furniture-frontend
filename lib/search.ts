/**
 * Public search helpers — re-exported from lib/search/* for stable imports.
 * Prefer `@/lib/search` or `@/lib/search/normalize` in new code.
 */

export {
  MAX_SEARCH_LENGTH,
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
  SUGGEST_DEBOUNCE_MS,
  SUGGEST_TIMEOUT_MS,
  SUGGEST_PRODUCT_LIMIT,
  SUGGEST_CATEGORY_LIMIT,
  SUGGEST_SUBCATEGORY_LIMIT,
  normalizeSearch,
  isSearchableQuery,
  clampSearchInput,
  buildSearchResultsHref,
} from "@/lib/search/normalize";

export { scoreSuggestion, sortByRelevance, splitHighlight } from "@/lib/search/ranking";
export type { MatchTier, RankableSuggestion } from "@/lib/search/ranking";

export {
  compactSearchKey,
  matchesLoosely,
  toFlexiblePattern,
  findFlexibleMatch,
} from "@/lib/search/flexibleMatch";

export type {
  SearchSuggestion,
  SearchSuggestionKind,
  SuggestErrorKind,
  SuggestState,
  ProductSearchClient,
} from "@/lib/search/types";

export { mongoSearchClient, SearchRequestError } from "@/lib/search/mongoSearchClient";
