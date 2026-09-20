import type { MetadataRoute } from "next";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import { absoluteImageUrl, absoluteUrl } from "@/lib/seo/site";

export const SITEMAP_PAGE_LIMIT = 500;
export const SITEMAP_MAX_URLS = 50_000;
export const SITEMAP_MAX_PAGES = 1000;

export const SITEMAP_DATA_TYPES = [
  "products",
  "categories",
  "subcategories",
  "sections",
] as const;

export type SitemapDataType = (typeof SITEMAP_DATA_TYPES)[number];

export type SitemapDataEntry = {
  slug: string;
  updatedAt?: string;
  image?: string;
  parentSlug?: string;
};

type SitemapDataPage = {
  type?: SitemapDataType;
  data?: SitemapDataEntry[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export function parseSitemapDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function sitemapImageUrls(image?: string): string[] | undefined {
  if (!image) return undefined;
  return [absoluteImageUrl(image)];
}

export function pathForSitemapEntry(
  type: SitemapDataType,
  entry: SitemapDataEntry,
): string | null {
  const slug = entry.slug?.trim();
  if (!slug) return null;

  switch (type) {
    case "products":
      return `/products/${slug}`;
    case "categories":
      return `/category/${slug}`;
    case "subcategories": {
      const parent = entry.parentSlug?.trim();
      if (!parent) return null;
      return `/category/${parent}/${slug}`;
    }
    case "sections":
      return `/${slug}`;
  }
}

export function toSitemapRoute(
  type: SitemapDataType,
  entry: SitemapDataEntry,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] | null {
  const path = pathForSitemapEntry(type, entry);
  if (!path) return null;

  const lastModified = parseSitemapDate(entry.updatedAt);
  const images = sitemapImageUrls(entry.image);

  return {
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
    ...(images ? { images } : {}),
  };
}

export function chunkSitemapEntries<T>(
  entries: T[],
  max = SITEMAP_MAX_URLS,
): T[][] {
  if (max < 1) return [entries];
  if (entries.length === 0) return [[]];

  const chunks: T[][] = [];
  for (let i = 0; i < entries.length; i += max) {
    chunks.push(entries.slice(i, i + max));
  }
  return chunks;
}

export function assertSitemapPageBudget(
  page: number,
  type: SitemapDataType,
): void {
  if (page > SITEMAP_MAX_PAGES) {
    throw new Error(
      `Sitemap pagination exceeded ${SITEMAP_MAX_PAGES} pages for ${type}`,
    );
  }
}

export function assertSitemapUrlBudget(
  count: number,
  type: SitemapDataType,
): void {
  if (count > SITEMAP_MAX_URLS) {
    throw new Error(`Sitemap exceeded ${SITEMAP_MAX_URLS} URLs for ${type}`);
  }
}

export async function fetchSitemapEntriesByType(
  type: SitemapDataType,
  locale: "fr" | "en" = "fr",
): Promise<SitemapDataEntry[]> {
  const out: SitemapDataEntry[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await serverFetch<SitemapDataPage>(
      `/seo/sitemap-data?type=${type}&page=${page}&limit=${SITEMAP_PAGE_LIMIT}&locale=${locale}`,
      { revalidate: 3600 },
    );

    if (isServerFetchError(res)) {
      throw new Error(`Sitemap data unavailable for ${type}`);
    }

    totalPages = Math.max(1, res.totalPages ?? 1);
    const rows = res.data ?? [];
    out.push(...rows);
    assertSitemapUrlBudget(out.length, type);

    if (rows.length === 0) break;
    page += 1;
    assertSitemapPageBudget(page, type);
  }

  return out;
}

export function routesForSitemapType(
  type: SitemapDataType,
  entries: SitemapDataEntry[],
): MetadataRoute.Sitemap {
  const priority =
    type === "products"
      ? 0.9
      : type === "subcategories"
        ? 0.7
        : 0.8;

  const routes: MetadataRoute.Sitemap = [];
  for (const entry of entries) {
    const route = toSitemapRoute(type, entry, "weekly", priority);
    if (route) routes.push(route);
  }
  return routes;
}
