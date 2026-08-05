// features/subcategories/components/SubcategoryTable.tsx
"use client";

import { memo } from "react";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/image";
import { STATUS_META } from "../constants";
import { parentCategoryLabel } from "../utils/subcategoryFilters";
import { SubcategoryCatalogEmpty } from "./SubcategoryCatalogEmpty";
import { SubcategoryRowMenu } from "./SubcategoryRowMenu";
import type { Category, Subcategory, SubcategoryStatusFilter } from "../types";

const COL_SPAN = 7;

type SubcategoryTableProps = {
  subcategories: Subcategory[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isFetching: boolean;
  categories: Category[];
  selectedStatus: SubcategoryStatusFilter;
  selectedSubcategoryIds: string[];
  hasActiveFilters: boolean;
  canCreate: boolean;
  onToggleSubcategory: (id: string) => void;
  onToggleAllVisible: () => void;
  onEdit: (subcategory: Subcategory) => void;
  onDelete: (id: string) => void;
  onMove?: (subcategory: Subcategory, direction: -1 | 1) => void;
  onAddSubcategory?: () => void;
  onClearFilters?: () => void;
  canDelete: boolean;
  canReorder?: boolean;
  reordering?: boolean;
  /** Index inside the reorder scope (siblings under the filtered parent). */
  orderIndexById?: Map<string, number>;
  orderLength?: number;
  onPageChange: (page: number) => void;
};

function SubcategoryTableComponent({
  subcategories,
  total,
  page,
  pageSize,
  isLoading,
  isFetching,
  categories,
  selectedStatus,
  selectedSubcategoryIds,
  hasActiveFilters,
  canCreate,
  onToggleSubcategory,
  onToggleAllVisible,
  onEdit,
  onDelete,
  onMove,
  onAddSubcategory,
  onClearFilters,
  canDelete,
  canReorder = false,
  reordering = false,
  orderIndexById,
  orderLength = 0,
  onPageChange,
}: SubcategoryTableProps) {
  const visibleIds = subcategories.map((s) => s._id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedSubcategoryIds.includes(id));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showInitialSkeleton = isLoading && subcategories.length === 0;
  const showFetchOverlay = isFetching && subcategories.length > 0;
  const isEmpty = !showInitialSkeleton && subcategories.length === 0;
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div
      id="subcategory-catalog-panel"
      role="tabpanel"
      aria-labelledby={`subcategory-status-tab-${selectedStatus}`}
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
                    <span className="sr-only">Loading subcategories</span>
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
          <SubcategoryCatalogEmpty
            variant={hasActiveFilters ? "filtered" : "empty"}
            canCreate={canCreate}
            onAddSubcategory={onAddSubcategory}
            onClearFilters={onClearFilters}
          />
        ) : (
          <>
            <div className="md:hidden divide-y divide-slate-800/60">
              {subcategories.map((s) => (
                <SubcategoryMobileCard
                  key={s._id}
                  subcategory={s}
                  selected={selectedSubcategoryIds.includes(s._id)}
                  parentLabel={parentCategoryLabel(s, categories)}
                  canDelete={canDelete}
                  canReorder={canReorder}
                  reordering={reordering}
                  orderIndex={orderIndexById?.get(s._id) ?? -1}
                  orderLength={orderLength}
                  onToggle={() => onToggleSubcategory(s._id)}
                  onEdit={() => onEdit(s)}
                  onDelete={() => onDelete(s._id)}
                  onMove={onMove ? (dir) => onMove(s, dir) : undefined}
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
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Subcategory</th>
                  <th className="px-4 py-3 font-medium">Parent category</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="w-12 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((s) => (
                  <SubcategoryRow
                    key={s._id}
                    subcategory={s}
                    selected={selectedSubcategoryIds.includes(s._id)}
                    parentLabel={parentCategoryLabel(s, categories)}
                    canDelete={canDelete}
                    canReorder={canReorder}
                    reordering={reordering}
                    orderIndex={orderIndexById?.get(s._id) ?? -1}
                    orderLength={orderLength}
                    onToggle={() => onToggleSubcategory(s._id)}
                    onEdit={() => onEdit(s)}
                    onDelete={() => onDelete(s._id)}
                    onMove={onMove ? (dir) => onMove(s, dir) : undefined}
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
            {total === 0 ? "No subcategories" : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
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

type SubcategoryRowProps = {
  subcategory: Subcategory;
  selected: boolean;
  parentLabel: string;
  canDelete: boolean;
  canReorder?: boolean;
  reordering?: boolean;
  orderIndex?: number;
  orderLength?: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove?: (direction: -1 | 1) => void;
};

type SubcategoryMobileCardProps = SubcategoryRowProps;

function OrderControls({
  name,
  sortOrder,
  canReorder,
  reordering,
  orderIndex,
  orderLength,
  onMove,
}: {
  name: string;
  sortOrder: number;
  canReorder?: boolean;
  reordering?: boolean;
  orderIndex?: number;
  orderLength?: number;
  onMove?: (direction: -1 | 1) => void;
}) {
  const index = orderIndex ?? -1;
  const lastIndex = (orderLength ?? 0) - 1;

  return (
    <div className="flex items-center gap-2">
      <span className="w-6 font-mono text-[11px] text-slate-500">{sortOrder}</span>
      {canReorder && onMove && (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={reordering || index <= 0}
            className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
            aria-label={`Move ${name} up`}
          >
            <ArrowUp className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={reordering || index < 0 || index >= lastIndex}
            className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
            aria-label={`Move ${name} down`}
          >
            <ArrowDown className="h-3 w-3" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ isActive, className = "" }: { isActive: boolean; className?: string }) {
  const meta = STATUS_META[isActive ? "active" : "inactive"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}

function SubcategoryThumbnail({ image, size }: { image?: string; size: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-10 w-10" : "h-12 w-12";

  if (!image) {
    return <div className={`${sizeClass} shrink-0 rounded-md bg-slate-800/80`} aria-hidden />;
  }

  return (
    <img
      src={getImageUrl(image)}
      alt=""
      className={`${sizeClass} shrink-0 rounded-md bg-slate-800 object-cover`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function SubcategoryMobileCard({
  subcategory: s,
  selected,
  parentLabel,
  canDelete,
  canReorder,
  reordering,
  orderIndex,
  orderLength,
  onToggle,
  onEdit,
  onDelete,
  onMove,
}: SubcategoryMobileCardProps) {
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
        aria-label={`Select ${s.name}`}
      />
      <SubcategoryThumbnail image={s.image} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-50">{s.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{parentLabel}</p>
          </div>
          <SubcategoryRowMenu
            subcategoryId={s._id}
            subcategoryName={s.name}
            canDelete={canDelete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
        {s.slug && <p className="mt-2 truncate font-mono text-[11px] text-slate-500">{s.slug}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs">
          <StatusBadge isActive={s.isActive} />
          <OrderControls
            name={s.name}
            sortOrder={s.sortOrder ?? 0}
            canReorder={canReorder}
            reordering={reordering}
            orderIndex={orderIndex}
            orderLength={orderLength}
            onMove={onMove}
          />
        </div>
      </div>
    </div>
  );
}

const SubcategoryRow = memo(function SubcategoryRow({
  subcategory: s,
  selected,
  parentLabel,
  canDelete,
  canReorder,
  reordering,
  orderIndex,
  orderLength,
  onToggle,
  onEdit,
  onDelete,
  onMove,
}: SubcategoryRowProps) {
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
          aria-label={`Select ${s.name}`}
        />
      </td>
      <td className="px-4 py-3.5 align-middle">
        <OrderControls
          name={s.name}
          sortOrder={s.sortOrder ?? 0}
          canReorder={canReorder}
          reordering={reordering}
          orderIndex={orderIndex}
          orderLength={orderLength}
          onMove={onMove}
        />
      </td>
      <td className="px-4 py-3.5 align-middle">
        <div className="flex items-center gap-3">
          <SubcategoryThumbnail image={s.image} size="sm" />
          <span className="font-medium text-slate-50">{s.name}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 align-middle">
        <span className="text-slate-300">{parentLabel}</span>
      </td>
      <td className="px-4 py-3.5 align-middle font-mono text-xs text-slate-500">{s.slug ?? "—"}</td>
      <td className="px-4 py-3.5 align-middle">
        <StatusBadge isActive={s.isActive} />
      </td>
      <td className="px-4 py-3.5 align-middle">
        <SubcategoryRowMenu
          subcategoryId={s._id}
          subcategoryName={s.name}
          canDelete={canDelete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
});

export const SubcategoryTable = memo(SubcategoryTableComponent);
