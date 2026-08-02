import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import ProductCard from "@/components/product/ProductCard";
import ProductAddToCart from "@/components/product/ProductAddToCart";
import ProductImageViewer from "@/components/product/ProductImageViewer";
import { CURRENCY } from "@/lib/config";
import { getImageUrl } from "@/lib/image";
import {
  discountBadgeLabel,
  formatBDT,
  getFinalPrice,
  hasProductDiscount,
  isLowStock,
  isOutOfStock,
  isProductNew,
} from "@/lib/productPrice";
import type { StoreProduct, LocalizedField } from "@/types/product";
import { fetchProductBySlugOrId, plainDescription } from "@/lib/seo/catalog";

export const revalidate = 60;

// Matches the backend's default until locale-prefixed routing exists.
// Centralized here so there's exactly one place to change when/if this
// page moves under app/[locale]/...
const LOCALE: "fr" | "en" = "fr";

// SEO metadata fields, per locale — matches the seo.{locale} schema on
// the backend Product model (admin's SeoMetadataSection writes these).
type SeoBlock = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
};

type StructuredDataBlock = {
  gtin?: string;
  mpn?: string;
  brand?: string;
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
};

// description is a locale object too, matching the backend's
// product.description shape. seo/structuredData/noIndex are typed here
// directly rather than reached via `as any` — this file is exactly the
// one place that consumes them, so an untyped shape here is where a
// typo or backend drift would go uncaught longest.
type Product = Omit<StoreProduct, "name" | "slug"> & {
  name: LocalizedField;
  slug: LocalizedField;
  description?: LocalizedField;
  category?: string;
  seo?: Partial<Record<"fr" | "en", SeoBlock>>;
  structuredData?: StructuredDataBlock;
  noIndex?: boolean;
};

type ProductsApiResponse = {
  data?: Product[];
  total?: number;
};

// Single helper for resolving a locale string, falling back to French
// (always populated) rather than crashing or rendering "undefined".
function pickLocale(field: LocalizedField | undefined, locale: "fr" | "en" = LOCALE): string {
  if (!field) return "";
  return field[locale] || field.fr || "";
}

const getProduct = cache(async (slug: string) => fetchProductBySlugOrId(slug));

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product not found",
      description: "This product could not be found at Meubles De Paris.",
      robots: { index: false, follow: false },
    };
  }

  const displayName = pickLocale(product.name);

  // Prefer the dedicated SEO field (written for search intent) over the
  // raw product name, falling back through: seo.metaTitle → product name.
  const seoBlock = product.seo?.[LOCALE];
  const title = seoBlock?.metaTitle || displayName;

  const description =
    seoBlock?.metaDescription ||
    (product.description
      ? plainDescription(pickLocale(product.description))
      : `Shop ${displayName} — premium furniture and décor at Meubles De Paris.`);

  // FIXED: seoBlock.ogImage / product.images[0] are both possibly a raw
  // R2 object key, not an absolute URL — getImageUrl() converts either
  // (it's a no-op if already an absolute http(s) URL, so this is safe
  // regardless of which source the image came from). Without this,
  // shared links on Facebook/WhatsApp/etc. silently fail to show a
  // preview image, since crawlers require an absolute URL.
  const rawOgImage = seoBlock?.ogImage || product.images?.[0];
  const ogImage = rawOgImage ? getImageUrl(rawOgImage) : undefined;

  return {
    title,
    description,
    alternates: seoBlock?.canonicalUrl ? { canonical: seoBlock.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    // Honor an explicit noIndex flag if the product has one, in addition
    // to the existing draft/inactive-status check.
    ...(product.noIndex || (product.status && product.status !== "active")
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const displayName = pickLocale(product.name);
  const displayDescription = product.description ? pickLocale(product.description) : undefined;

  // Related products
  let relatedProducts: Product[] = [];
  if (product.category) {
    const res = await serverFetch(
      `/products?category=${product.category}&limit=4&exclude=${product._id}`,
      { revalidate: 60 },
    );
    if (!isServerFetchError(res)) {
      const payload = res as ProductsApiResponse | Product[];
      relatedProducts = Array.isArray(payload) ? payload : (payload?.data ?? []);
    }
  }

  // Derived
  const discounted = hasProductDiscount(product);
  const final      = getFinalPrice(product);
  const stock      = product.quantity ?? 0;
  const oos        = isOutOfStock(product.quantity);
  const low        = isLowStock(product.quantity);
  const isNew      = isProductNew(product.createdAt);
  const offLabel   = discountBadgeLabel(product);

  const TRUST = [
    `Free shipping on orders over ${CURRENCY}500`,
    "30-day returns",
    "Secure checkout",
  ] as const;

  // JSON-LD structured data — feeds Google's Product rich-result
  // eligibility. Only emitted if structuredData exists on the product;
  // absent fields (gtin/mpn) are simply omitted rather than sent empty,
  // since Google treats a missing field differently from an empty one.
  const sd = product.structuredData;
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: displayName,
    image: product.images,
    description: displayDescription,
    ...(sd?.brand ? { brand: { "@type": "Brand", name: sd.brand } } : {}),
    ...(sd?.gtin ? { gtin: sd.gtin } : {}),
    ...(sd?.mpn ? { mpn: sd.mpn } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: CURRENCY,
      price: discounted ? final : product.price,
      availability: oos
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      ...(sd?.condition ? { itemCondition: `https://schema.org/${sd.condition}` } : {}),
    },
  };

  return (
    <>
      {/* JSON-LD for Google rich results (star ratings/price appear in
          search once reviews exist; price/availability work today). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-[#A09080]">
            <li><Link href="/" className="hover:text-[#B8935A] transition-colors">Home</Link></li>
            <li aria-hidden className="select-none">›</li>
            <li><Link href="/products" className="hover:text-[#B8935A] transition-colors">Products</Link></li>
            <li aria-hidden className="select-none">›</li>
            <li className="text-[#1A1A1A] font-medium truncate max-w-[180px] sm:max-w-sm" aria-current="page">
              {displayName}
            </li>
          </ol>
        </nav>

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-8 lg:gap-14">

          {/* Left — image viewer */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="relative flex flex-col h-[360px] sm:h-[480px] lg:h-[580px] xl:h-[640px] rounded-2xl border border-[#E8E2D9] overflow-hidden bg-[#F5F0EA]">
              <ProductImageViewer images={product.images} alt={displayName} />
            </div>
          </div>

          {/* Right — product info */}
          <div className="flex flex-col gap-6">

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {offLabel && (
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-[#B8935A] text-white px-3 py-1 rounded-full">
                    {offLabel}
                  </span>
                )}
                {isNew && !offLabel && (
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase bg-[#1A1A1A] text-white px-3 py-1 rounded-full">
                    New arrival
                  </span>
                )}
                {oos && (
                  <span className="text-[10px] font-semibold tracking-wide text-[#6B6560] bg-[#F0EBE3] border border-[#E8E2D9] px-3 py-1 rounded-full">
                    Out of stock
                  </span>
                )}
                {!oos && low && (
                  <span className="text-[10px] font-semibold tracking-wide text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Only {stock} left
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-[28px] font-semibold text-[#1A1A1A] leading-snug tracking-tight">
                {displayName}
              </h1>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-5 border-b border-[#E8E2D9]">
              {discounted ? (
                <>
                  <span className="text-[2rem] font-bold text-[#B8935A] tabular-nums leading-none">
                    {formatBDT(final)}
                  </span>
                  <span className="text-base text-[#A09080] line-through tabular-nums">
                    {formatBDT(product.price)}
                  </span>
                  <span className="text-xs font-semibold text-[#2D6A4F] bg-[#EAF4EE] px-2 py-0.5 rounded-full">
                    You save {formatBDT(product.price - final)}
                  </span>
                </>
              ) : (
                <span className="text-[2rem] font-bold text-[#1A1A1A] tabular-nums leading-none">
                  {formatBDT(product.price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 -mt-2">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${oos ? "bg-[#A09080]" : "bg-[#2D6A4F]"}`}
                aria-hidden
              />
              <span className="text-xs text-[#6B6560]">
                {oos
                  ? "Currently unavailable"
                  : stock <= 10
                    ? `${stock} in stock — ships today`
                    : "In stock — ready to ship"}
              </span>
            </div>

            {displayDescription && (
              <div className="pb-5 border-b border-[#E8E2D9]">
                <p className="text-[13px] text-[#6B6560] leading-[1.8] whitespace-pre-line">
                  {displayDescription}
                </p>
              </div>
            )}

            <ProductAddToCart product={product} />

            <div className="flex flex-col gap-2 pt-1">
              {TRUST.map((text) => (
                <div key={text} className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#F5EDD8] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#B8935A]" aria-hidden />
                  </span>
                  <span className="text-xs text-[#6B6560]">{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Related products ──────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section
            aria-label="Related products"
            className="mt-20 pt-12 border-t border-[#E8E2D9]"
          >
            <div className="flex items-center justify-between mb-7">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#B8935A] mb-1">
                  You may also like
                </p>
                <h2 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">
                  Complete the look
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#6B6560] hover:text-[#B8935A] transition-colors duration-200 group"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} locale={LOCALE} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}