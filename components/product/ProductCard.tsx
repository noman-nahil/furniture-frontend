import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { getImageUrl } from "@/lib/image";

function pickLocale(field: LocalizedField, locale: "fr" | "en"): string {
  return field[locale] || field.fr || "";
}

export type ProductCardProduct = Pick <
  StoreProduct,
  | "_id"
  | "name"
  | "price"
  | "slug"
  | "images"
  | "discount"
  | "discountPrice"
  | "discountStartsAt"
  | "discountEndsAt"
  | "quantity"
  | "createdAt"
>;

function isRemoteImage(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function ProductCard({
  product,
  locale = "fr",
}: {
  product: ProductCardProduct;
  locale?: "fr" | "en";
}) {
  const image      = product.images?.[0] ?? "/placeholder.png";
  const oos        = isOutOfStock(product.quantity);
  const low        = isLowStock(product.quantity);
  const isNew      = isProductNew(product.createdAt);
  const badge      = discountBadgeLabel(product);
  const discounted = hasProductDiscount(product);
  const finalPrice = getFinalPrice(product);

  // CHANGED: no more cast needed — StoreProduct now types these
  // correctly as LocalizedField.
  const displayName = pickLocale(product.name, locale);
  const slugValue = pickLocale(product.slug, locale);

  return (
    <Link
      href={`/products/${slugValue}`}
      aria-label={`View ${displayName}`}
      className="group relative flex flex-col bg-[#FAFAF8] rounded-lg sm:rounded-xl overflow-hidden border border-[#E8E2D9] active:scale-[0.98] sm:active:scale-100 hover:border-[#B8935A]/40 hover:shadow-[0_8px_30px_rgba(184,147,90,0.12)] transition-all duration-300"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden ">
        <Image
          src={getImageUrl(image)}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-contain p-2 sm:p-3 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          unoptimized={isRemoteImage(image)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/30 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />

        {/* <div className="hidden sm:flex absolute bottom-0 left-0 right-0 items-center justify-center pb-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#1A1A1A] text-[11px] font-semibold tracking-[0.08em] uppercase px-4 py-2 rounded-full shadow-sm">
            View details
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 12 12" aria-hidden>
              <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div> */}

        {!oos && badge && (
          <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-[#B8935A] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm">
            {badge}
          </span>
        )}

        {isNew && !badge && (
          <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-[#1A1A1A] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
            New
          </span>
        )}

        {/* {oos && (
          <div className="absolute bottom-0 inset-x-0 z-10 bg-[#1A1A1A]/80 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-center py-1 sm:py-1.5">
            Out of stock
          </div>
        )} */}
          {oos && (
            <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-red-600 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md">
              Out of Stock
            </span>
          )}

        {!oos && low && (
          <span className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 z-10 text-[9px] sm:text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 sm:px-2 rounded-full">
            Only a few left
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-3 sm:py-3">
        <h3 className="text-[12.5px] sm:text-sm font-medium text-[#1A1A1A] leading-snug line-clamp-2 min-h-[2.2rem] sm:min-h-[2.6rem] group-hover:text-[#B8935A] transition-colors duration-200">
          {displayName}
        </h3>

        <div className="h-px bg-[#E8E2D9]" />

        <div className="flex items-baseline justify-between gap-2">
          {discounted ? (
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="text-sm sm:text-base font-bold text-[#B8935A] tabular-nums">
                {formatBDT(finalPrice)}
              </span>
              <span className="text-[11px] sm:text-xs text-[#A09080] line-through tabular-nums">
                {formatBDT(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-sm sm:text-base font-bold text-[#1A1A1A] tabular-nums">
              {formatBDT(product.price)}
            </span>
          )}
{/* 
          <span className="text-[#C8B8A2] group-hover:text-[#B8935A] transition-colors duration-200 shrink-0" aria-hidden>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 16 16">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span> */}
          <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:block text-[11px] font-medium uppercase tracking-wider text-[#B8935A] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            View Details
          </span>

          <span
            className="text-[#C8B8A2] group-hover:text-[#B8935A] transition-colors duration-200"
            aria-hidden
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 16 16"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);