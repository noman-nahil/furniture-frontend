import { describe, expect, it } from "vitest";
import { absoluteUrl } from "./site";
import {
  SITEMAP_MAX_PAGES,
  SITEMAP_MAX_URLS,
  assertSitemapPageBudget,
  assertSitemapUrlBudget,
  chunkSitemapEntries,
  parseSitemapDate,
  pathForSitemapEntry,
  sitemapImageUrls,
  toSitemapRoute,
} from "./sitemapData";

describe("parseSitemapDate", () => {
  it("parses ISO dates and rejects invalid values", () => {
    expect(parseSitemapDate("2026-04-01T08:00:00.000Z")?.toISOString()).toBe(
      "2026-04-01T08:00:00.000Z",
    );
    expect(parseSitemapDate(undefined)).toBeUndefined();
    expect(parseSitemapDate("not-a-date")).toBeUndefined();
  });
});

describe("pathForSitemapEntry", () => {
  it("builds catalog paths and skips incomplete subcategory rows", () => {
    expect(
      pathForSitemapEntry("products", { slug: "canape-milano" }),
    ).toBe("/products/canape-milano");
    expect(pathForSitemapEntry("categories", { slug: "salon" })).toBe(
      "/category/salon",
    );
    expect(
      pathForSitemapEntry("subcategories", {
        slug: "canapes",
        parentSlug: "salon",
      }),
    ).toBe("/category/salon/canapes");
    expect(pathForSitemapEntry("subcategories", { slug: "canapes" })).toBeNull();
    expect(pathForSitemapEntry("sections", { slug: "featured-products" })).toBe(
      "/featured-products",
    );
  });
});

describe("toSitemapRoute", () => {
  it("uses updatedAt as lastModified and absolute image URLs", () => {
    const route = toSitemapRoute(
      "products",
      {
        slug: "canape-milano",
        updatedAt: "2026-04-01T08:00:00.000Z",
        image: "https://cdn.example.com/products/milano.webp",
      },
      "weekly",
      0.9,
    );

    expect(route).toMatchObject({
      url: absoluteUrl("/products/canape-milano"),
      changeFrequency: "weekly",
      priority: 0.9,
      images: ["https://cdn.example.com/products/milano.webp"],
    });
    const lastModified = route?.lastModified;
    expect(
      lastModified instanceof Date
        ? lastModified.toISOString()
        : lastModified,
    ).toBe("2026-04-01T08:00:00.000Z");
  });

  it("turns a site-relative image path into an absolute URL", () => {
    const route = toSitemapRoute(
      "categories",
      { slug: "salon", image: "/categories/salon.webp" },
      "weekly",
      0.8,
    );
    expect(route?.images).toEqual([absoluteUrl("/categories/salon.webp")]);
  });
});

describe("sitemapImageUrls", () => {
  it("omits missing images", () => {
    expect(sitemapImageUrls(undefined)).toBeUndefined();
  });

  it("builds an absolute URL from a relative image path", () => {
    const urls = sitemapImageUrls("products/milano.webp");
    expect(urls).toHaveLength(1);
    expect(urls?.[0]).toMatch(/^https?:\/\//);
    expect(urls?.[0]).toContain("products/milano.webp");
  });
});

describe("chunkSitemapEntries", () => {
  it("returns one empty chunk when there are no URLs", () => {
    expect(chunkSitemapEntries([])).toEqual([[]]);
  });

  it("does not split at the 50k boundary", () => {
    const entries = Array.from({ length: SITEMAP_MAX_URLS }, (_, i) => i);
    expect(chunkSitemapEntries(entries)).toHaveLength(1);
  });

  it("splits when a list exceeds 50k URLs", () => {
    const entries = Array.from({ length: SITEMAP_MAX_URLS + 1 }, (_, i) => i);
    const chunks = chunkSitemapEntries(entries);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toHaveLength(SITEMAP_MAX_URLS);
    expect(chunks[1]).toHaveLength(1);
  });
});

describe("sitemap fetch budgets", () => {
  it("throws when pagination exceeds SITEMAP_MAX_PAGES", () => {
    expect(() =>
      assertSitemapPageBudget(SITEMAP_MAX_PAGES, "products"),
    ).not.toThrow();
    expect(() =>
      assertSitemapPageBudget(SITEMAP_MAX_PAGES + 1, "products"),
    ).toThrow(/exceeded 1000 pages for products/);
  });

  it("throws when a type exceeds SITEMAP_MAX_URLS", () => {
    expect(() =>
      assertSitemapUrlBudget(SITEMAP_MAX_URLS, "categories"),
    ).not.toThrow();
    expect(() =>
      assertSitemapUrlBudget(SITEMAP_MAX_URLS + 1, "categories"),
    ).toThrow(/exceeded 50000 URLs for categories/);
  });
});
