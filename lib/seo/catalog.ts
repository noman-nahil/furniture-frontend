import { cache } from "react";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
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

// ─────────────────────────────────────────────
// Product fetching
// ─────────────────────────────────────────────

// CHANGED: accepts `locale` and forwards it to the backend as a query
// param on both the slug and ID lookup calls. Previously neither call
// specified locale, silently relying on the backend's own default.
async function loadProductBySlugOrId(
  id: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ProductForMeta | null> {
  const slugRes = await serverFetch(`/products/slug/${id}?locale=${locale}`, {
    revalidate: 60,
  });
  if (!isServerFetchError(slugRes)) {
    const product = extractProduct(slugRes);
    if (product) return product;
  }

  // Note: if your backend's /products/slug/:slug returns 404 for a valid
  // slug (not a 5xx), serverFetch returns a client_error and we fall
  // through correctly. If the ID is also invalid, we return null and
  // the page calls notFound().
  const idRes = await serverFetch(`/products/${id}?locale=${locale}`, {
    revalidate: 60,
  });
  if (!isServerFetchError(idRes)) {
    return extractProduct(idRes);
  }

  return null;
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

/** Full category record (name + image) for OG metadata. */
export async function fetchCategoryBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<CategoryNav | null> {
  const categories = await fetchActiveCategories(locale);
  if (!categories) return null;
  return categories.find((c) => c.slug === slug) ?? null;
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

type SitemapHomepageSection = {
  slug?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
};

/**
 * Active homepage sections for sitemap generation (`/{slug}` view-all pages).
 * Uses GET /homepage-sections (active-only) and skips invalid/reserved slugs.
 */
export async function fetchActiveHomepageSectionsForSitemap(): Promise<
  Array<{ slug: string; lastModified?: Date }>
> {
  const res = await serverFetch<SitemapHomepageSection[]>(
    "/homepage-sections",
    { revalidate: 3600 },
  );

  if (isServerFetchError(res) || !Array.isArray(res)) return [];

  const out: Array<{ slug: string; lastModified?: Date }> = [];

  for (const section of res) {
    if (section.status && section.status !== "active") continue;

    const slug = String(section.slug ?? "")
      .trim()
      .toLowerCase();
    if (!slug || RESERVED_SECTION_SLUGS.has(slug)) continue;

    const rawDate = section.updatedAt || section.createdAt;
    out.push({
      slug,
      lastModified: rawDate ? new Date(rawDate) : undefined,
    });
  }

  return out;
}

type SitemapProduct = {
  slug: LocalizedField;
  updatedAt?: string;
  createdAt?: string;
  noIndex?: boolean;
  status?: string;
};

type ProductsListResponse = {
  data?: SitemapProduct[];
  total?: number;
  totalPages?: number;
  page?: number;
};

/**
 * Paginates the public product list for sitemap generation.
 * Max page size on the API is 100 — we walk every page.
 */
export async function fetchAllProductsForSitemap(
  locale: Locale = DEFAULT_LOCALE,
): Promise<Array<{ slug: string; lastModified?: Date }>> {
  const limit = 100;
  const out: Array<{ slug: string; lastModified?: Date }> = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await serverFetch<ProductsListResponse>(
      `/products?page=${page}&limit=${limit}&locale=${locale}`,
      { revalidate: 3600 },
    );

    if (isServerFetchError(res) || !res || typeof res !== "object") break;

    const payload = res as ProductsListResponse;
    totalPages = Math.max(1, payload.totalPages ?? 1);
    const rows = payload.data ?? [];

    for (const product of rows) {
      if (product.noIndex) continue;
      if (product.status && product.status !== "active") continue;

      const slug =
        product.slug?.[locale] || product.slug?.fr || "";
      if (!slug) continue;

      const rawDate = product.updatedAt || product.createdAt;
      out.push({
        slug,
        lastModified: rawDate ? new Date(rawDate) : undefined,
      });
    }

    if (rows.length === 0) break;
    page += 1;
    // Safety cap — avoids infinite loops if the API misreports totalPages
    if (page > 200) break;
  }

  return out;
}

/**
 * Returns both the category and subcategory display names for a given
 * slug pair. Used in SubcategoryPage for metadata and h1/breadcrumb.
 */
export async function fetchSubcategoryTitles(
  categorySlug: string,
  subcategorySlug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<{ category: string; subcategory: string } | null> {
  const categories = await fetchActiveCategories(locale);
  if (!categories) return null;

  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat) return null;

  const want = subcategorySlug.toLowerCase();
  const sub  = cat.subcategories?.find((s) => {
    const sl = (s.slug ?? "").toLowerCase();
    return sl === want || slugify(s.name) === want;
  });

  // If subcategory not found in DB, fall back gracefully to a humanised
  // version of the slug rather than returning null — page still renders
  // with a reasonable title even if the subcategory was recently renamed
  // or deleted.
  const subName =
    sub?.name ??
    subcategorySlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return { category: cat.name, subcategory: subName };
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