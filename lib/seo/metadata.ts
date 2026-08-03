import type { Metadata } from "next";
import {
  absoluteImageUrl,
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "@/lib/seo/site";

export type BuildPageMetadataInput = {
  title: string;
  description?: string;
  /** Site-relative path, e.g. `/products/sofa` — used for canonical + og:url */
  path: string;
  /** Raw image key, absolute URL, or site path. Falls back to default OG image. */
  image?: string | null;
  imageAlt?: string;
  keywords?: string[];
  type?: "website" | "article" | "product";
  noIndex?: boolean;
  /** When true, skip follow as well as index */
  noFollow?: boolean;
};

/**
 * Shared metadata builder for Open Graph + Twitter Card + canonical URLs.
 * Every public page should go through this so crawlers (Facebook, WhatsApp,
 * LinkedIn, X, Discord, Telegram, Slack, Teams, etc.) get consistent tags.
 */
export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  imageAlt,
  keywords,
  type = "website",
  noIndex = false,
  noFollow = false,
}: BuildPageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const ogImageUrl = absoluteImageUrl(image);
  const ogImages = [
    {
      url: ogImageUrl,
      width: DEFAULT_OG_IMAGE.width,
      height: DEFAULT_OG_IMAGE.height,
      alt: imageAlt || title,
    },
  ];

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical,
    },
    openGraph: {
      type: type === "product" ? "website" : type,
      locale: "fr_FR",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    ...(noIndex || noFollow
      ? {
          robots: {
            index: !noIndex,
            follow: !noFollow,
            googleBot: {
              index: !noIndex,
              follow: !noFollow,
            },
          },
        }
      : {}),
  };
}
