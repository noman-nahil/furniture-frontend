"use client";

import { useCallback } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";

// ─────────────────────────────────────────────
// Shared type
// ─────────────────────────────────────────────

export type ListProduct = Parameters<typeof ProductCard>[0]["product"];

type PaginatedProductGridProps = {
  products: ListProduct[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  search: string;
  emptyState: ReactNode;
  locale?: "fr" | "en";
};

// ─────────────────────────────────────────────
// Pagination bar
// ─────────────────────────────────────────────

function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  locale = "fr",
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  locale?: "fr" | "en";
  // ✅ Removed `search` prop — it was accepted but never used inside
  //    PaginationBar. pageUrl() reads all params from useSearchParams()
  //    (including ?search=) so the search term is already preserved
  //    in the URL without needing to pass it explicitly.
}) {
  const searchParams = useSearchParams();

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);
  const prevLabel = locale === "fr" ? "Préc." : "Prev";
  const nextLabel = locale === "fr" ? "Suivant" : "Next";
  const showingLabel =
    locale === "fr"
      ? `Affichage ${start}–${end} sur ${total} produits`
      : `Showing ${start}–${end} of ${total} products`;

  // ✅ Wrapped in useCallback — pageUrl was a plain function defined inside
  //    the render body, recreated on every render. With useCallback it's
  //    stable across renders. Minor here since PaginationBar isn't memoized,
  //    but good habit for functions used in JSX event handlers / hrefs.
  const pageUrl = useCallback(
    (p: number) => {
      const qs = new URLSearchParams(searchParams.toString());
      qs.set("page", String(p));
      return `?${qs.toString()}`;
    },
    [searchParams],
  );

  const visiblePages = (() => {
    if (totalPages <= 9) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set<number>();
    set.add(1);
    set.add(totalPages);
    for (let i = page - 2; i <= page + 2; i++) {
      if (i >= 1 && i <= totalPages) set.add(i);
    }
    return [...set].sort((a, b) => a - b);
  })();

  if (totalPages <= 1) return null;

  const navBtn =
    "rounded-lg border border-teal-700/30 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-700 hover:text-white transition-colors";
  const navBtnDisabled =
    "rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-300 cursor-not-allowed";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-8 border-t border-gray-200">
      <span className="text-sm text-gray-600 tabular-nums">
        {showingLabel}
      </span>

      <nav
        className="flex flex-wrap items-center justify-center gap-1"
        aria-label="Pagination"
      >
        {/* Prev */}
        {page > 1 ? (
          <Link
            href={pageUrl(page - 1)}
            className={navBtn}
            // ✅ Added rel="prev" — standard HTML hint that tells browsers
            //    and crawlers this link points to the previous page in a
            //    sequence. Helps search engines understand pagination structure.
            rel="prev"
          >
            {prevLabel}
          </Link>
        ) : (
          <span
            className={navBtnDisabled}
            aria-disabled="true"
          >
            {prevLabel}
          </span>
        )}

        {/* Page numbers */}
        {visiblePages.map((p, idx) => {
          const prev        = visiblePages[idx - 1];
          const showEllipsis = prev != null && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-2 text-gray-400" aria-hidden>…</span>
              )}
              <Link
                href={pageUrl(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={p === page ? `Page ${p}, current` : `Go to page ${p}`}
                className={`min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm font-medium tabular-nums text-center transition-colors ${
                  p === page
                    ? "bg-teal-700 text-white pointer-events-none"
                    : "border border-teal-700/30 text-teal-700 hover:bg-teal-700 hover:text-white"
                }`}
              >
                {p}
              </Link>
            </span>
          );
        })}

        {/* Next */}
        {page < totalPages ? (
          <Link
            href={pageUrl(page + 1)}
            className={navBtn}
            // ✅ Added rel="next" — same as rel="prev" above.
            rel="next"
          >
            {nextLabel}
          </Link>
        ) : (
          <span
            className={navBtnDisabled}
            aria-disabled="true"
          >
            {nextLabel}
          </span>
        )}
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────
// Grid
// ─────────────────────────────────────────────

export function PaginatedProductGrid({
  products,
  total,
  page,
  totalPages,
  limit,
  search,
  emptyState,
  locale = "fr",
}: PaginatedProductGridProps) {
  if (products.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        locale={locale}
        // ✅ Removed: search is no longer passed to PaginationBar since
        //    it never used it — pageUrl() reads ?search= from useSearchParams().
      />
    </div>
  );
}