"use client";

import { PackageOpen, SearchX } from "lucide-react";

type ProductCatalogEmptyProps = {
  variant: "empty" | "filtered";
  canCreate?: boolean;
  onAddProduct?: () => void;
  onClearFilters?: () => void;
};

export function ProductCatalogEmpty({
  variant,
  canCreate = false,
  onAddProduct,
  onClearFilters,
}: ProductCatalogEmptyProps) {
  const isFiltered = variant === "filtered";

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-400">
        {isFiltered ? (
          <SearchX className="h-6 w-6" aria-hidden />
        ) : (
          <PackageOpen className="h-6 w-6" aria-hidden />
        )}
      </div>
      <h3 className="text-base font-medium text-slate-100">
        {isFiltered ? "No products match your filters" : "No products yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {isFiltered
          ? "Try adjusting your search, category, stock, or status filter."
          : "Add your first product to start building your catalog."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {isFiltered && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Clear filters
          </button>
        )}
        {!isFiltered && canCreate && onAddProduct && (
          <button
            type="button"
            onClick={onAddProduct}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            Add product
          </button>
        )}
      </div>
    </div>
  );
}
