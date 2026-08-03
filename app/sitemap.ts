import type { MetadataRoute } from "next";
import {
  fetchAllProductsForSitemap,
  getActiveCategories,
} from "@/lib/seo/catalog";
import { getSiteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/order-tracking`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const [categories, products] = await Promise.all([
    getActiveCategories("fr"),
    fetchAllProductsForSitemap("fr"),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = [];

  if (categories) {
    for (const category of categories) {
      categoryRoutes.push({
        url: `${siteUrl}/category/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });

      for (const sub of category.subcategories ?? []) {
        if (!sub.slug) continue;
        categoryRoutes.push({
          url: `${siteUrl}/category/${category.slug}/${sub.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: product.lastModified ?? now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
