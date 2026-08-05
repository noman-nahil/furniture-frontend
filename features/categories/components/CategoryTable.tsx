// features/categories/components/CategoryTable.tsx
"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { getImageUrl } from "@/lib/image";
import type { Category } from "../types";

type CategoryTableProps = {
  categories: Category[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onMove: (category: Category, direction: -1 | 1) => void;
  canDelete: boolean;
  canReorder: boolean;
  reordering: boolean;
};

export function CategoryTable({
  categories,
  loading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onMove,
  canDelete,
  canReorder,
  reordering,
}: CategoryTableProps) {
  const lastIndex = categories.length - 1;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-300">All categories</p>
        <div className="flex items-center gap-3">
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, slug, ID…"
            className="w-56 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-slate-600"
          />
          {loading && <p className="text-xs text-slate-500">Loading…</p>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Image</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No categories match.
                </td>
              </tr>
            ) : (
              categories.map((c, index) => (
                <tr key={c._id} className="border-t border-slate-800/80 hover:bg-slate-900/60">
                  <td className="px-4 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="w-6 font-mono text-[11px] text-slate-500">
                        {c.sortOrder ?? 0}
                      </span>
                      {canReorder && (
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => onMove(c, -1)}
                            disabled={reordering || index === 0}
                            className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                            aria-label={`Move ${c.name} up`}
                          >
                            <ArrowUp className="h-3 w-3" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMove(c, 1)}
                            disabled={reordering || index === lastIndex}
                            className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                            aria-label={`Move ${c.name} down`}
                          >
                            <ArrowDown className="h-3 w-3" aria-hidden />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-middle text-slate-50">{c.name}</td>
                  <td className="px-4 py-2 align-middle">
                    <img
                      src={c.image ? getImageUrl(c.image) : "/logo-transparent.webp"}
                      alt={c.name}
                      className="h-10 w-10 rounded-md border border-slate-700 bg-slate-950/60 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 align-middle font-mono text-[11px] text-slate-500">{c.slug}</td>
                  <td className="px-4 py-2 align-middle">
                    <span className={c.isActive !== false ? "text-emerald-400" : "text-amber-400"}>
                      {c.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(c._id)}
                          className="rounded-md border border-red-600/70 px-2 py-1 text-[11px] text-red-300 hover:bg-red-950"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
