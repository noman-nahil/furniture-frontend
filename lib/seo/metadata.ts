import type { Metadata } from "next";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  socialImageUrl,
  usableSeoText,
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

export const META_DESCRIPTION_MAX = 160;

/** Trim at a word boundary. Titles are never truncated here. */
export function trimMetaDescription(
  text: string,
  max = META_DESCRIPTION_MAX,
): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;

  const slice = normalized.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[\s.,;:!?-]+$/u, "");
}

/**
 * Shared metadata builder for Open Graph + Twitter Card + canonical URLs.
 * Every public page should go through this so crawlers (Facebook, WhatsApp,
 * LinkedIn, X, Discord, Telegram, Slack, Teams, etc.) get consistent tags.
 *
 * Images go through socialImageUrl so WhatsApp/Messenger get JPEG instead of
 * R2 WebP (which those clients often drop from the preview).
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
  const resolvedDescription = trimMetaDescription(
    usableSeoText(description) ?? DEFAULT_DESCRIPTION,
  );
  const canonical = absoluteUrl(path);
  const ogImageUrl = socialImageUrl(image);
  const ogImages = [
    {
      url: ogImageUrl,
      secureUrl: ogImageUrl,
      width: DEFAULT_OG_IMAGE.width,
      height: DEFAULT_OG_IMAGE.height,
      alt: imageAlt || title,
      type: "image/jpeg",
    },
  ];

  return {
    title,
    description: resolvedDescription,
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
      description: resolvedDescription,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
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
