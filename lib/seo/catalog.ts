import { cache } from "react";
import {
  serverFetch,
  isServerFetchError,
  type ServerFetchFailure,
} from "@/lib/serverFetch";
import type { StoreProduct, LocalizedField } from "@/types/product";
import type { CategoryNav } from "@/types/categoryNav";
import type { PublicHomepageSection } from "@/features/homepage-sections/types";
import { slugify } from "@/lib/slug";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

// CHANGED: description is now a locale object, matching the backend's
// product.description shape (name/slug already carry this via
// StoreProduct after the type fix).
type SeoBlock = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
};

export type ProductForMeta = StoreProduct & {
  description?: LocalizedField;
  category?: string;
  seo?: Partial<Record<"fr" | "en", SeoBlock>>;
  structuredData?: {
    gtin?: string;
    mpn?: string;
    brand?: string;
    condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
  };
  noIndex?: boolean;
};

type ProductApiResponse =
  | ProductForMeta
  | { product?: ProductForMeta }
  | { data?: ProductForMeta };

// NEW: matches the locale union used across the frontend since the i18n
// migration (backend's SUPPORTED_LOCALES / DEFAULT_LOCALE = "fr").
export type Locale = "fr" | "en";
const DEFAULT_LOCALE: Locale = "fr";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Extracts a single product from whatever shape the API returns.
 * Handles: bare object, { product: ... }, { data: ... }.
 */
function extractProduct(res: unknown): ProductForMeta | null {
  if (!res || typeof res !== "object" || Array.isArray(res)) return null;

  const r = res as ProductApiResponse;

  const candidate =
    "product" in r && r.product
      ? r.product
      : "data" in r && r.data
        ? r.data
        : (r as ProductForMeta);

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }

  // Minimal validity check — a product must at least have a name
  // (now an object { fr, en? } rather than a string, but the presence
  // check itself is unaffected).
  return "name" in candidate ? (candidate as ProductForMeta) : null;
}

export type TaxonomyLookup<T> =
  | { state: "unavailable" }
  | { state: "missing" }
  | { state: "found"; value: T };

export type ProductLookup = TaxonomyLookup<ProductForMeta>;

/** 404 from the API is a real miss; timeout/5xx/other failures are outages. */
export function classifyCatalogFetchFailure(
  res: Pick<ServerFetchFailure, "status">,
): "missing" | "unavailable" {
  return res.status === 404 ? "missing" : "unavailable";
}

/** Only 24-char hex strings are safe to send to GET /products/:id. */
export function shouldLookupProductById(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

// ─────────────────────────────────────────────
// Product fetching
// ─────────────────────────────────────────────

// CHANGED: accepts `locale` and forwards it to the backend as a query
// param on both the slug and ID lookup calls. Previously neither call
// specified locale, silently relying on the backend's own default.
async function loadProductBySlugOrId(
  id: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ProductLookup> {
  const slugRes = await serverFetch(`/products/slug/${id}?locale=${locale}`, {
    revalidate: 60,
  });
  if (!isServerFetchError(slugRes)) {
    const product = extractProduct(slugRes);
    return product
      ? { state: "found", value: product }
      : { state: "missing" };
  }

  // The URL param is usually a slug. Only try GET /products/:id for a real
  // ObjectId — mongoose isValid() also accepts some 12-char strings, and a
  // CastError would surface as 400 (unavailable) instead of a 404.
  if (
    classifyCatalogFetchFailure(slugRes) === "unavailable" ||
    !shouldLookupProductById(id)
  ) {
    return classifyCatalogFetchFailure(slugRes) === "unavailable"
      ? { state: "unavailable" }
      : { state: "missing" };
  }

  const idRes = await serverFetch(`/products/${id}?locale=${locale}`, {
    revalidate: 60,
  });
  if (!isServerFetchError(idRes)) {
    const product = extractProduct(idRes);
    return product
      ? { state: "found", value: product }
      : { state: "missing" };
  }

  return classifyCatalogFetchFailure(idRes) === "missing"
    ? { state: "missing" }
    : { state: "unavailable" };
}

/**
 * Deduplicates between generateMetadata and the page render via React
 * cache(). Both calls resolve in one fetch per request — cache() keys on
 * all arguments, so (id, locale) pairs are cached independently, meaning
 * a French and English request for the same id never share a stale
 * cache entry.
 */
export const fetchProductBySlugOrId = cache(loadProductBySlugOrId);

// ─────────────────────────────────────────────
// Category fetching
// ─────────────────────────────────────────────

// CHANGED: accepts locale, forwarded to the backend. Category names are
// presumably also going through (or will go through) the same fr/en
// locale-object treatment as products — confirm when you send
// categoryModel.js — but this at least stops silently requesting
// French-only category data regardless of the page's locale.
const fetchActiveCategories = cache(
  async (locale: Locale = DEFAULT_LOCALE): Promise<CategoryNav[] | null> => {
    const res = await serverFetch<CategoryNav[]>(
      `/categories/active?locale=${locale}`,
      { revalidate: 60 },
    );
    if (isServerFetchError(res) || !Array.isArray(res)) return null;
    return res;
  },
);

/**
 * Returns the display name of a category by its slug.
 * Returns null if not found or the fetch failed.
 */
export async function fetchCategoryNameBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<string | null> {
  const categories = await fetchActiveCategories(locale);
  if (!categories) return null;
  return categories.find((c) => c.slug === slug)?.name ?? null;
}

/** Match a category slug against an already-loaded active list. */
export function findCategoryInList(
  categories: CategoryNav[],
  slug: string,
): CategoryNav | undefined {
  return categories.find((c) => c.slug === slug);
}

/**
 * Resolve subcategory display names from an already-loaded list.
 * Returns null when the category or subcategory does not exist — callers
 * must 404 rather than invent a title from the slug.
 */
export function resolveSubcategoryFromList(
  categories: CategoryNav[],
  categorySlug: string,
  subcategorySlug: string,
): { category: string; subcategory: string } | null {
  const cat = findCategoryInList(categories, categorySlug);
  if (!cat) return null;

  const want = subcategorySlug.toLowerCase();
  const sub = cat.subcategories?.find((s) => {
    const sl = (s.slug ?? "").toLowerCase();
    return sl === want || slugify(s.name) === want;
  });
  if (!sub) return null;

  return { category: cat.name, subcategory: sub.name };
}

/** Full category record (name + image) for OG metadata. */
export async function fetchCategoryBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<CategoryNav | null> {
  const lookup = await lookupActiveCategory(slug, locale);
  return lookup.state === "found" ? lookup.value : null;
}

/** Distinguish API failure from a slug that is not in the active taxonomy. */
export async function lookupActiveCategory(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<TaxonomyLookup<CategoryNav>> {
  const categories = await fetchActiveCategories(locale);
  if (!categories) return { state: "unavailable" };
  const category = findCategoryInList(categories, slug);
  if (!category) return { state: "missing" };
  return { state: "found", value: category };
}

/** Active categories (+ nested subs) — used by sitemap + category OG. */
export const getActiveCategories = fetchActiveCategories;

// ─────────────────────────────────────────────
// Homepage section fetching (View All pages)
// ─────────────────────────────────────────────

/**
 * Public homepage section by slug. Deduplicated via React cache() so
 * generateMetadata and the page share one request.
 * Returns null for missing/inactive sections (API 404 → client_error).
 */
export const fetchHomepageSectionBySlug = cache(
  async (slug: string): Promise<PublicHomepageSection | null> => {
    const normalized = slug.trim().toLowerCase();
    if (!normalized) return null;
    // Crawlers still ask for WordPress leftovers like /sitemap_index.xml.
    // Those hit `/{sectionSlug}` and must not call the homepage-section API.
    if (/\.[a-z0-9]{2,5}$/i.test(normalized)) return null;
    if (RESERVED_SECTION_SLUGS.has(normalized)) return null;

    const res = await serverFetch<PublicHomepageSection>(
      `/homepage-sections/slug/${encodeURIComponent(normalized)}`,
      { revalidate: 60 },
    );

    if (isServerFetchError(res) || !res || typeof res !== "object") {
      return null;
    }

    if (!("slug" in res) || !("title" in res)) return null;
    return res;
  },
);

/**
 * Top-level path segments that already map to real App Router routes.
 * Section view-all URLs are `/{slug}`; colliding with these would duplicate
 * or shadow a non-section page in the sitemap.
 */
const RESERVED_SECTION_SLUGS = new Set([
  "products",
  "shop",
  "categories",
  "category",
  "cart",
  "checkout",
  "order-tracking",
  "login",
  "register",
  "admin",
  "manager",
  "dashboard",
  "maintenance",
  "api",
  "account",
  "og",
  "about",
  "contact",
  "privacy-policy",
  "shipping-delivery",
  "returns-exchanges",
  "404",
]);

export type SubcategoryTitlesLookup = TaxonomyLookup<{
  category: string;
  subcategory: string;
}>;

/**
 * Returns both the category and subcategory display names for a given
 * slug pair. Missing taxonomy is `missing` (404); API failure is
 * `unavailable` so a valid URL is not turned into a 404 during an outage.
 */
export async function fetchSubcategoryTitles(
  categorySlug: string,
  subcategorySlug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<SubcategoryTitlesLookup> {
  const categories = await fetchActiveCategories(locale);
  if (!categories) return { state: "unavailable" };

  const titles = resolveSubcategoryFromList(
    categories,
    categorySlug,
    subcategorySlug,
  );
  if (!titles) return { state: "missing" };
  return { state: "found", value: titles };
}

// ─────────────────────────────────────────────
// SEO helpers
// ─────────────────────────────────────────────

/**
 * Strips HTML tags and truncates to `max` characters for meta
 * descriptions. Expects a plain resolved string — callers must pick the
 * correct locale (e.g. `pickLocale(product.description, locale)`) before
 * passing it in; this function has no locale awareness of its own.
 */
export function plainDescription(htmlOrText: string, max = 160): string {
  const stripped = htmlOrText
    .replace(/<[^>]*>/g, " ")       // strip tags
    .replace(/&nbsp;/g,   " ")      // common entities
    .replace(/&amp;/g,    "&")
    .replace(/&lt;/g,     "<")
    .replace(/&gt;/g,     ">")
    .replace(/&quot;/g,   '"')
    .replace(/&#39;/g,    "'")
    .replace(/\s+/g,      " ")      // collapse whitespace
    .trim();

  return stripped.length <= max ? stripped : `${stripped.slice(0, max - 1)}…`;
}