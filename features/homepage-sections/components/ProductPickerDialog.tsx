// features/homepage-sections/components/ProductPickerDialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getImageUrl } from "@/lib/image";
import { useProductsQuery } from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types";
import { MAX_SECTION_PRODUCTS, PRODUCT_PICKER_PAGE_SIZE } from "../constants";
import type { SectionProduct } from "../types";

type ProductPickerDialogProps = {
  /** Current curated list, in order. Returned unchanged if the admin cancels. */
  selected: SectionProduct[];
  onCancel: () => void;
  onConfirm: (products: SectionProduct[]) => void;
};

function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * The admin product list and the storefront card describe products slightly
 * differently (slug is optional for admins). Narrow to the card's shape so the
 * picker, the curated list and the homepage all speak one type.
 */
function toSectionProduct(product: Product): SectionProduct {
  return {
    _id: product._id,
    name: { fr: product.name.fr, en: product.name.en },
    slug: { fr: product.slug?.fr ?? "", en: product.slug?.en },
    price: product.price,
    images: product.images,
    discount: product.discount,
    discountPrice: product.discountPrice,
    discountStartsAt: product.discountStartsAt,
    discountEndsAt: product.discountEndsAt,
    quantity: product.quantity,
    createdAt: product.createdAt,
    status: product.status,
  };
}

/** Mounted only while open, so the product search does not run in the background. */
export function ProductPickerDialog({
  selected,
  onCancel,
  onConfirm,
}: ProductPickerDialogProps) {
  const [draft, setDraft] = useState<SectionProduct[]>(selected);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery);

  useEffect(() => setPage(1), [debouncedSearch]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const filters = useMemo(
    () => ({ search: debouncedSearch, status: "ALL" as const }),
    [debouncedSearch],
  );

  const { data, isLoading, isFetching } = useProductsQuery(
    page,
    PRODUCT_PICKER_PAGE_SIZE,
    filters,
  );

  const draftIds = useMemo(() => new Set(draft.map((p) => p._id)), [draft]);
  const results = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PRODUCT_PICKER_PAGE_SIZE));
  const atCapacity = draft.length >= MAX_SECTION_PRODUCTS;

  function toggle(product: Product) {
    setDraft((prev) => {
      if (prev.some((p) => p._id === product._id)) {
        return prev.filter((p) => p._id !== product._id);
      }
      if (prev.length >= MAX_SECTION_PRODUCTS) return prev;
      // New picks land at the end so an existing curated order survives.
      return [...prev, toSectionProduct(product)];
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close product picker"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-full w-full max-w-2xl flex-col rounded-none border-slate-800 bg-slate-900 shadow-xl sm:h-[80vh] sm:rounded-xl sm:border"
      >
        <div className="border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-50">Add products</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {draft.length} selected · up to {MAX_SECTION_PRODUCTS}
          </p>

          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, description or ID…"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-slate-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoading ? (
            <p className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Loading products…
            </p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">
              No products match that search.
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((product) => {
                const checked = draftIds.has(product._id);
                const hidden = product.status && product.status !== "active";

                return (
                  <li key={product._id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-800/70 ${
                        checked ? "bg-slate-800/50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!checked && atCapacity}
                        onChange={() => toggle(product)}
                        className="h-3.5 w-3.5 shrink-0 accent-slate-200"
                      />
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-md border border-slate-700 bg-slate-950 object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs text-slate-100">
                          {product.name.fr || product.name.en}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {product.price} · stock {product.quantity}
                        </span>
                      </span>
                      {hidden && (
                        <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                          {product.status}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-[11px] tabular-nums text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(draft)}
              className="rounded-lg bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
