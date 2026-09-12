import { productFallbackDescription, usableSeoText } from "@/lib/seo/site";
import { plainDescription, type ProductForMeta } from "@/lib/seo/catalog";

type Locale = "fr" | "en";

function pickLocale(
  field: { fr?: string; en?: string } | undefined,
  locale: Locale,
): string {
  if (!field) return "";
  return field[locale] || field.fr || "";
}

export function resolveProductMetaTitle(
  name: string,
  seoMetaTitle?: string | null,
): string {
  return usableSeoText(seoMetaTitle) || name;
}

export function resolveProductMetaDescription(
  name: string,
  seoMetaDescription?: string | null,
  rawDescription?: string | null,
): string {
  const fromSeo = usableSeoText(seoMetaDescription);
  if (fromSeo) return fromSeo;

  if (rawDescription != null) {
    const fromBody = usableSeoText(plainDescription(rawDescription));
    if (fromBody) return fromBody;
  }

  return productFallbackDescription(name);
}

export function resolveProductJsonLdDescription(
  name: string,
  rawDescription?: string | null,
): string {
  if (rawDescription != null) {
    const fromBody = usableSeoText(plainDescription(rawDescription, 5000));
    if (fromBody) return fromBody;
  }
  return productFallbackDescription(name);
}

export type ResolvedProductPageSeo =
  | { missing: true }
  | {
      missing: false;
      title: string;
      description: string;
      jsonLdDescription: string;
      path: string;
      image?: string | null;
      imageAlt: string;
      keywords?: string[];
      noIndex: boolean;
      canonicalOverride?: string;
    };

export function resolveProductPageSeo(
  product: ProductForMeta | null,
  requestedSlug: string,
  locale: Locale = "fr",
): ResolvedProductPageSeo {
  if (!product) return { missing: true };

  const displayName = pickLocale(product.name, locale);
  const productSlug = pickLocale(product.slug, locale) || requestedSlug;
  const rawDescription = product.description
    ? pickLocale(product.description, locale)
    : "";
  const seoBlock = product.seo?.[locale];

  return {
    missing: false,
    title: resolveProductMetaTitle(displayName, seoBlock?.metaTitle),
    description: resolveProductMetaDescription(
      displayName,
      seoBlock?.metaDescription,
      rawDescription,
    ),
    jsonLdDescription: resolveProductJsonLdDescription(
      displayName,
      rawDescription,
    ),
    path: `/products/${productSlug}`,
    image: seoBlock?.ogImage || product.images?.[0],
    imageAlt: displayName,
    keywords: seoBlock?.keywords,
    noIndex:
      Boolean(product.noIndex) ||
      Boolean(product.status && product.status !== "active"),
    canonicalOverride: usableSeoText(seoBlock?.canonicalUrl),
  };
}
