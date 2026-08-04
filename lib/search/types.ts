export type SearchSuggestionKind =
  | "product"
  | "category"
  | "subcategory"
  | "viewAll";

export type SearchSuggestion = {
  id: string;
  kind: SearchSuggestionKind;
  label: string;
  href: string;
  image?: string;
  meta?: string;
  priceLabel?: string;
  skuHints?: string[];
};

export type SuggestErrorKind = "network" | "server" | "timeout" | "unknown";

export type SuggestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; items: SearchSuggestion[] }
  | { status: "empty"; query: string }
  | { status: "error"; kind: SuggestErrorKind; message: string };

/**
 * Swappable search backend contract.
 * Today: Mongo list API. Later: Typesense / ES / AI — same surface.
 */
export type SearchSuggestRequest = {
  query: string;
  limit: number;
  signal?: AbortSignal;
};

export type SearchSuggestProduct = {
  _id: string;
  name: { fr: string; en?: string };
  slug: { fr: string; en?: string };
  price: number;
  images?: string[];
  discount?: number;
  discountPrice?: number;
  discountStartsAt?: string;
  discountEndsAt?: string;
  finalPrice?: number;
  category?: string;
  structuredData?: {
    mpn?: string;
    gtin?: string;
    brand?: string;
  };
};

export type SearchSuggestResponse = {
  products: SearchSuggestProduct[];
};

export interface ProductSearchClient {
  suggest(req: SearchSuggestRequest): Promise<SearchSuggestResponse>;
}
