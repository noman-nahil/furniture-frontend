import { APP_NAME, CURRENCY_CODE, LOGO_PATH } from "@/lib/config";
import {
  absoluteImageUrl,
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo/site";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

/** Safe JSON-LD script tag for App Router server components. */
export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl(LOGO_PATH),
    description: DEFAULT_DESCRIPTION,
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(LOGO_PATH),
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/products")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type ProductJsonLdInput = {
  name: string;
  description?: string;
  images?: string[];
  path: string;
  price: number;
  currency?: string;
  inStock: boolean;
  brand?: string;
  gtin?: string;
  mpn?: string;
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
};

export function productJsonLd({
  name,
  description,
  images = [],
  path,
  price,
  currency = CURRENCY_CODE,
  inStock,
  brand,
  gtin,
  mpn,
  condition,
}: ProductJsonLdInput) {
  const absoluteImages = (images.length ? images : [undefined]).map((img) =>
    absoluteImageUrl(img),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || `Shop ${name} at ${APP_NAME}.`,
    image: absoluteImages,
    url: absoluteUrl(path),
    brand: {
      "@type": "Brand",
      name: brand || APP_NAME,
    },
    ...(gtin ? { gtin } : {}),
    ...(mpn ? { mpn } : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      priceCurrency: currency,
      price: Number(price).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: APP_NAME,
      },
      ...(condition
        ? { itemCondition: `https://schema.org/${condition}` }
        : { itemCondition: "https://schema.org/NewCondition" }),
    },
  };
}
