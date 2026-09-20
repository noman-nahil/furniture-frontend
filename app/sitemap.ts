import type { MetadataRoute } from "next";
import {
  fetchSitemapEntriesByType,
  routesForSitemapType,
} from "@/lib/seo/sitemapData";
import { getSiteUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/returns-exchanges`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/shipping-delivery`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const [products, categories, subcategories, sections] = await Promise.all([
    fetchSitemapEntriesByType("products"),
    fetchSitemapEntriesByType("categories"),
    fetchSitemapEntriesByType("subcategories"),
    fetchSitemapEntriesByType("sections"),
  ]);

  return [
    ...staticRoutes,
    ...routesForSitemapType("categories", categories),
    ...routesForSitemapType("subcategories", subcategories),
    ...routesForSitemapType("sections", sections),
    ...routesForSitemapType("products", products),
  ];
}
