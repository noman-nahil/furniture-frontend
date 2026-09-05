"use client";

import { memo, useMemo } from "react";
import { Loader2, Search, X } from "lucide-react";
import { subcategoryParentKey } from "../utils/productFilters";
import type { Category, StatusKey, StockFilterKey, Subcategory } from "../types";

export type ProductFilterStats = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  discountedProducts: number;
};

type StatusFilterKey = StatusKey | "ALL" | "DISCOUNTED";

const STATUS_TABS: { key: StatusFilterKey; label: string; statKey: keyof ProductFilterStats }[] = [
  { key: "ALL", label: "All", statKey: "totalProducts" },
  { key: "active", label: "Active", statKey: "activeProducts" },
  { key: "inactive", label: "Inactive", statKey: "inactiveProducts" },
  { key: "draft", label: "Draft", statKey: "draftProducts" },
  { key: "DISCOUNTED", label: "Discounted", statKey: "discountedProducts" },
];

type ProductFiltersToolbarProps = {
  stats: ProductFilterStats;
  selectedStatus: StatusFilterKey;
  onStatusChange: (value: StatusFilterKey) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSubcategory: string;
  onSubcategoryChange: (value: string) => void;
  selectedStock: StockFilterKey;
  onStockChange: (value: StockFilterKey) => void;
  categories: Category[];
  subcategories: Subcategory[];
  isFetching: boolean;
  visibleCount: number;
  filteredTotal: number;
};

function ProductFiltersToolbarComponent({
  stats,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
  selectedStock,
  onStockChange,
  categories,
  subcategories,
  isFetching,
  visibleCount,
  filteredTotal,
}: ProductFiltersToolbarProps) {
  const subsForCategory = useMemo(
    () =>
      selectedCategory
        ? subcategories.filter((s) => subcategoryParentKey(s) === String(selectedCategory))
        : [],
    [selectedCategory, subcategories],
  );

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Filter products by status"
        className="flex gap-1 overflow-x-auto border-b border-slate-800/80 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {STATUS_TABS.map(({ key, label, statKey }) => {
          const isActive = selectedStatus === key;
          const count = stats[statKey];

          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`product-status-tab-${key}`}
              aria-selected={isActive}
              aria-controls="product-catalog-panel"
              onClick={() => onStatusChange(key)}
              className={`relative shrink-0 rounded-t-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
                isActive ? "text-slate-100" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>{label}</span>
              <span
                className={`ml-1.5 tabular-nums text-xs ${isActive ? "text-slate-400" : "text-slate-600"}`}
              >
                {count}
              </span>
              {isActive && (
                <span
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-slate-100"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or ID"
              className="w-full rounded-lg border border-slate-800/80 bg-slate-950/50 py-2 pl-9 pr-9 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-slate-600 focus:ring-1 focus:ring-slate-600/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>

          <select
            id="product-category-filter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className="w-full shrink-0 rounded-lg border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600/40 sm:w-auto sm:min-w-[180px]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            id="product-subcategory-filter"
            value={selectedSubcategory}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            disabled={!selectedCategory}
            aria-label="Filter by subcategory"
            className="w-full shrink-0 rounded-lg border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600/40 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[180px]"
          >
            <option value="">
              {selectedCategory
                ? subsForCategory.length === 0
                  ? "No subcategories"
                  : "All subcategories"
                : "All subcategories"}
            </option>
            {subsForCategory.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            id="product-stock-filter"
            value={selectedStock}
            onChange={(e) => onStockChange(e.target.value as StockFilterKey)}
            aria-label="Filter by stock"
            className="w-full shrink-0 rounded-lg border border-slate-800/80 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600/40 sm:w-auto sm:min-w-[160px]"
          >
            <option value="ALL">All stock</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="low_stock">Low stock (1–5)</option>
          </select>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
          {isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" aria-label="Updating products" />
          )}
          <span aria-live="polite">
            {filteredTotal === 0
              ? "No products"
              : visibleCount === filteredTotal
                ? `${filteredTotal} product${filteredTotal === 1 ? "" : "s"}`
                : `${visibleCount} of ${filteredTotal} on this page`}
          </span>
        </div>
      </div>
    </div>
  );
}

export const ProductFiltersToolbar = memo(ProductFiltersToolbarComponent);
