"use client";

import { useCallback, useState } from "react";
import ProductCard, { type ProductCardProduct } from "./ProductCard";

export type FeaturedProduct = ProductCardProduct;

function PaginationBar({
  currentPage,
  totalPages,
  onPage,
}: {
  currentPage: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const visiblePages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set<number>([1, totalPages]);
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i >= 1 && i <= totalPages) set.add(i);
    }
    return [...set].sort((a, b) => a - b);
  })();

  const btnBase =
    "rounded-md sm:rounded-lg border border-gray-200 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      <button type="button" onClick={() => onPage(currentPage - 1)} disabled={currentPage <= 1} className={btnBase}>
        Prev
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
              className={`min-w-[2rem] sm:min-w-[2.25rem] rounded-md sm:rounded-lg border border-gray-200 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium tabular-nums transition hover:bg-gray-100 ${
                p === currentPage
                  ? "bg-gray-900 text-white hover:bg-gray-900 pointer-events-none"
                  : "text-gray-700"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button type="button" onClick={() => onPage(currentPage + 1)} disabled={currentPage >= totalPages} className={btnBase}>
        Next
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
}: {
  products: FeaturedProduct[];
  locale?: "fr" | "en";
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  /** Must be unique per section — it's the scroll target for pagination. */
  anchorId?: string;
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
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-blue-500" />
            <span className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {eyebrow}
            </span>
            <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-blue-500" />
          </div>
        )}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
        {paginatedProducts.map((product) => (
          <ProductCard key={product._id} product={product} locale={locale} />
        ))}
      </div>

      <PaginationBar currentPage={currentPage} totalPages={totalPages} onPage={goPage} />
    </section>
  );
}