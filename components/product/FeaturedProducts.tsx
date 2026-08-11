"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard, { type ProductCardProduct } from "./ProductCard";

export type FeaturedProduct = ProductCardProduct;

function PaginationBar({
  currentPage,
  totalPages,
  onPage,
  locale = "fr",
}: {
  currentPage: number;
  totalPages: number;
  onPage: (p: number) => void;
  locale?: "fr" | "en";
}) {
  if (totalPages <= 1) return null;

  const prevLabel = locale === "fr" ? "Préc." : "Prev";
  const nextLabel = locale === "fr" ? "Suivant" : "Next";

  const visiblePages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set<number>([1, totalPages]);
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i >= 1 && i <= totalPages) set.add(i);
    }
    return [...set].sort((a, b) => a - b);
  })();

  const btnBase =
    "rounded-md sm:rounded-lg border border-teal-700/30 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-teal-700 transition hover:bg-teal-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-teal-700";

  return (
    <div className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      <button type="button" onClick={() => onPage(currentPage - 1)} disabled={currentPage <= 1} className={btnBase}>
        {prevLabel}
      </button>

      {visiblePages.map((p, idx) => {
        const prev = visiblePages[idx - 1];
        const showEllipsis = prev != null && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5 sm:gap-2">
            {showEllipsis && <span className="px-0.5 sm:px-1 text-gray-400" aria-hidden>…</span>}
            <button
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`min-w-[2rem] sm:min-w-[2.25rem] rounded-md sm:rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium tabular-nums transition ${
                p === currentPage
                  ? "border-teal-700 bg-teal-700 text-white pointer-events-none"
                  : "border-teal-700/30 text-teal-700 hover:bg-teal-700 hover:text-white"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button type="button" onClick={() => onPage(currentPage + 1)} disabled={currentPage >= totalPages} className={btnBase}>
        {nextLabel}
      </button>
    </div>
  );
}

const ITEMS_PER_PAGE = 12;

// CHANGED: accepts an optional locale prop, defaulting to "fr" (matches
// the backend's DEFAULT_LOCALE). Pages rendering the English site should
// pass locale="en" explicitly.
//
// CHANGED: the heading is a prop now. The homepage renders one of these per
// configured homepage section, so the copy has to come from the section
// rather than being baked in. `eyebrow` and `subtitle` render only when
// supplied — they used to be hardcoded Featured-Products wording, which
// would read wrong above a section named something else.
export function FeaturedProducts({
  products,
  locale = "fr",
  title = "Featured Products",
  eyebrow,
  subtitle,
  anchorId = "featured-products",
  viewAllHref,
}: {
  products: FeaturedProduct[];
  locale?: "fr" | "en";
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  /** Must be unique per section — it's the scroll target for pagination. */
  anchorId?: string;
  /** Storefront path for View All, e.g. `/featured-products`. */
  viewAllHref?: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const goPage = useCallback(
    (p: number) => {
      const next = Math.min(Math.max(1, p), totalPages);
      setCurrentPage(next);
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [totalPages, anchorId]
  );

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(start, start + ITEMS_PER_PAGE);

  if (products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-14 sm:py-20 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">No products available at the moment.</p>
      </section>
    );
  }

  return (
    <section
      id={anchorId}
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 scroll-mt-16 sm:scroll-mt-20"
    >
      <header className="mb-7 sm:mb-9 lg:mb-11">
        {eyebrow && (
          <div className="mb-2.5 sm:mb-3 flex items-center gap-2">
            <div className="h-px w-6 sm:w-10 bg-gradient-to-r from-[#B8935A]/60 to-transparent" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#B8935A]">
              {eyebrow}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <h2 className="min-w-0 flex-1 font-serif text-[1.35rem] sm:text-2xl lg:text-[1.85rem] font-semibold leading-tight tracking-[-0.015em] text-[#1A1A1A]">
            <span className="block truncate sm:whitespace-normal sm:overflow-visible">
              {title}
            </span>
          </h2>

          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="group inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-full border border-[#E8E2D9] bg-[#FAFAF8] px-3 py-1.5 sm:px-5 sm:py-2.5 text-[11px] sm:text-sm font-medium tracking-[0.04em] text-[#1A1A1A] transition-all duration-300 ease-out hover:border-[#B8935A]/45 hover:bg-white hover:text-[#B8935A] hover:shadow-[0_4px_16px_rgba(184,147,90,0.12)] active:scale-[0.98]"
            >
              <span>View All</span>
              <ArrowRight
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          ) : null}
        </div>

        {subtitle && (
          <p className="mt-2.5 sm:mt-3 max-w-2xl text-sm sm:text-base text-[#6B6560]">
            {subtitle}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
        {paginatedProducts.map((product) => (
          <ProductCard key={product._id} product={product} locale={locale} />
        ))}
      </div>

      <PaginationBar currentPage={currentPage} totalPages={totalPages} onPage={goPage} locale={locale} />
    </section>
  );
}