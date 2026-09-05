// features/products/components/ProductTable.tsx
"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { discountBadgeLabel, getFinalPrice, hasProductDiscount } from "@/lib/productPrice";
import { pickLocale } from "@/lib/locale";
import { STATUS_META } from "../constants";
import { categoryNameById, subcategoryNameById } from "../utils/productFilters";
import { getImageUrl } from "../utils/r2Url";
import { ProductCatalogEmpty } from "./ProductCatalogEmpty";
import { ProductRowMenu } from "./ProductRowMenu";
import type { Category, Product, StatusKey, Subcategory } from "../types";

const COL_SPAN = 7;
const LOW_STOCK_THRESHOLD = 5;

function quantityTone(quantity: number): string {
  if (quantity <= 0) return "tabular-nums text-rose-300";
  if (quantity <= LOW_STOCK_THRESHOLD) return "tabular-nums text-amber-300";
  return "tabular-nums text-slate-300";
}

type ProductTableProps = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isFetching: boolean;
  categories: Category[];
  subcategories: Subcategory[];
  selectedStatus: StatusKey | "ALL" | "DISCOUNTED";
  selectedProductIds: string[];
  hasActiveFilters: boolean;
  canCreate: boolean;
  onToggleProduct: (id: string) => void;
  onToggleAllVisible: () => void;
  onEdit: (product: Product) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddProduct?: () => void;
  onClearFilters?: () => void;
  canDelete: boolean;
  canDuplicate: boolean;
  onPageChange: (page: number) => void;
};

function ProductTableComponent({
  products,
  total,
  page,
  pageSize,
  isLoading,
  isFetching,
  categories,
  selectedStatus,
  selectedProductIds,
  hasActiveFilters,
  canCreate,
  onToggleProduct,
  onToggleAllVisible,
  onEdit,
  onDuplicate,
  onDelete,
  onAddProduct,
  onClearFilters,
  canDelete,
  canDuplicate,
  onPageChange,
  subcategories,
}: ProductTableProps) {
  const visibleIds = products.map((p) => p._id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedProductIds.includes(id));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showInitialSkeleton = isLoading && products.length === 0;
  const showFetchOverlay = isFetching && products.length > 0;
  const isEmpty = !showInitialSkeleton && products.length === 0;
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div
      id="product-catalog-panel"
      role="tabpanel"
      aria-labelledby={`product-status-tab-${selectedStatus}`}
      aria-busy={isFetching}
      className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/40"
    >
      <div className="relative max-h-[560px] overflow-x-auto overflow-y-auto">
        {showFetchOverlay && (
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center bg-slate-950/40 pt-16 backdrop-blur-[1px]"
            aria-hidden
          >
            <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 shadow-lg">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
              Updating…
            </div>
          </div>
        )}

        {showInitialSkeleton ? (
          <>
            <div className="md:hidden divide-y divide-slate-800/60">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-4 py-4">
                  <div
                    className="h-16 animate-pulse rounded-lg bg-slate-800/80"
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                </div>
              ))}
            </div>
            <table className="hidden w-full text-left text-sm text-slate-300 md:table">
              <thead className="sticky top-0 z-10 bg-slate-900/95 text-xs text-slate-400 backdrop-blur-sm">
                <tr>
                  <th colSpan={COL_SPAN} className="px-4 py-3">
                    <span className="sr-only">Loading products</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-800/60">
                    <td colSpan={COL_SPAN} className="px-4 py-4">
                      <div
                        className="h-4 animate-pulse rounded bg-slate-800/80"
                        style={{ animationDelay: `${i * 60}ms` }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : isEmpty ? (
          <ProductCatalogEmpty
            variant={hasActiveFilters ? "filtered" : "empty"}
            canCreate={canCreate}
            onAddProduct={onAddProduct}
            onClearFilters={onClearFilters}
          />
        ) : (
          <>
            <div className="md:hidden divide-y divide-slate-800/60">
              {products.map((p) => (
                <ProductMobileCard
                  key={p._id}
                  product={p}
                  selected={selectedProductIds.includes(p._id)}
                  categoryLabel={categoryNameById(categories, p.category)}
                  subcategoryLabel={
                    p.subcategory ? subcategoryNameById(subcategories, p.subcategory) : undefined
                  }
                  canDelete={canDelete}
                  canDuplicate={canDuplicate}
                  onToggle={() => onToggleProduct(p._id)}
                  onEdit={() => onEdit(p)}
                  onDuplicate={() => onDuplicate(p._id)}
                  onDelete={() => onDelete(p._id)}
                />
              ))}
            </div>

            <table className="hidden w-full text-left text-sm text-slate-300 md:table">
              <thead className="sticky top-0 z-10 bg-slate-900/95 text-xs text-slate-400 backdrop-blur-sm">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={onToggleAllVisible}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500"
                      aria-label="Select all visible"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="w-12 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <ProductRow
                    key={p._id}
                    product={p}
                    selected={selectedProductIds.includes(p._id)}
                    categoryLabel={categoryNameById(categories, p.category)}
                    subcategoryLabel={
                      p.subcategory ? subcategoryNameById(subcategories, p.subcategory) : undefined
                    }
                    canDelete={canDelete}
                    canDuplicate={canDuplicate}
                    onToggle={() => onToggleProduct(p._id)}
                    onEdit={() => onEdit(p)}
                    onDuplicate={() => onDuplicate(p._id)}
                    onDelete={() => onDelete(p._id)}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {!isEmpty && (
        <div className="flex flex-col gap-3 border-t border-slate-800/80 px-4 py-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span aria-live="polite">
            {total === 0
              ? "No products"
              : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline tabular-nums">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-md border border-slate-700 px-2.5 py-1.5 transition-colors hover:bg-slate-800/60 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-md border border-slate-700 px-2.5 py-1.5 transition-colors hover:bg-slate-800/60 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ProductRowProps = {
  product: Product;
  selected: boolean;
  categoryLabel: string;
  subcategoryLabel?: string;
  canDelete: boolean;
  canDuplicate: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

type ProductMobileCardProps = ProductRowProps;

function ProductMobileCard({
  product: p,
  selected,
  categoryLabel,
  subcategoryLabel,
  canDelete,
  canDuplicate,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductMobileCardProps) {
  const sk = (p.status === "inactive" || p.status === "draft" ? p.status : "active") as StatusKey;
  const sm = STATUS_META[sk];
  const name = pickLocale(p.name);
  const saleLabel = discountBadgeLabel(p);

  return (
    <div
      className={`flex gap-3 px-4 py-4 transition-colors ${
        selected ? "bg-slate-900/80" : "hover:bg-slate-900/40"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-700 bg-slate-900 text-amber-500"
        aria-label={`Select ${name}`}
      />
      {p.images && p.images.length > 0 ? (
        <img
          src={getImageUrl(p.images[0])}
          alt=""
          className="h-12 w-12 shrink-0 rounded-md object-cover bg-slate-800"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded-md bg-slate-800/80" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-50">{name}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {categoryLabel}
              {subcategoryLabel ? ` · ${subcategoryLabel}` : ""}
            </p>
          </div>
          <ProductRowMenu
            productId={p._id}
            productName={name}
            canDelete={canDelete}
            canDuplicate={canDuplicate}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          {hasProductDiscount(p) ? (
            <>
              <span className="text-xs text-slate-500 line-through tabular-nums">{formatCurrency(p.price)}</span>
              <span className="text-sm font-medium tabular-nums text-slate-100">{formatCurrency(getFinalPrice(p))}</span>
            </>
          ) : (
            <span className="text-sm tabular-nums text-slate-100">{formatCurrency(p.price)}</span>
          )}
          {saleLabel && (
            <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-300">
              {saleLabel}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${sm.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} aria-hidden />
            {sm.label}
          </span>
          <span className={quantityTone(p.quantity ?? 0)}>Qty {p.quantity ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

const ProductRow = memo(function ProductRow({
  product: p,
  selected,
  categoryLabel,
  subcategoryLabel,
  canDelete,
  canDuplicate,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductRowProps) {
  const sk = (p.status === "inactive" || p.status === "draft" ? p.status : "active") as StatusKey;
  const sm = STATUS_META[sk];
  const name = pickLocale(p.name);
  const saleLabel = discountBadgeLabel(p);

  return (
    <tr
      className={`border-t border-slate-800/60 transition-colors ${
        selected ? "bg-slate-900/80" : "hover:bg-slate-900/50"
      }`}
    >
      <td className="px-4 py-3.5 align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500"
          aria-label={`Select ${name}`}
        />
      </td>
      <td className="px-4 py-3.5 align-middle">
        <div className="flex items-center gap-3">
          {p.images && p.images.length > 0 ? (
            <img
              src={getImageUrl(p.images[0])}
              alt=""
              className="h-10 w-10 shrink-0 rounded-md object-cover bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-md bg-slate-800/80" aria-hidden />
          )}
          <span className="font-medium text-slate-50">{name}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 align-middle">
        <span className="text-slate-300">{categoryLabel}</span>
        {subcategoryLabel && (
          <span className="mt-0.5 block text-xs text-slate-500">{subcategoryLabel}</span>
        )}
      </td>
      <td className="px-4 py-3.5 align-middle">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {hasProductDiscount(p) ? (
            <>
              <span className="text-slate-500 line-through tabular-nums">{formatCurrency(p.price)}</span>
              <span className="font-medium tabular-nums text-slate-100">{formatCurrency(getFinalPrice(p))}</span>
            </>
          ) : (
            <span className="tabular-nums text-slate-100">{formatCurrency(p.price)}</span>
          )}
          {saleLabel && (
            <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-300">
              {saleLabel}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5 align-middle">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sm.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} aria-hidden />
          {sm.label}
        </span>
      </td>
      <td className={`px-4 py-3.5 align-middle ${quantityTone(p.quantity ?? 0)}`}>{p.quantity ?? 0}</td>
      <td className="px-4 py-3.5 align-middle">
        <ProductRowMenu
          productId={p._id}
          productName={name}
          canDelete={canDelete}
          canDuplicate={canDuplicate}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
});

export const ProductTable = memo(ProductTableComponent);
