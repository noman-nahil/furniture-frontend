// features/banners/components/BannerTable.tsx
"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { getImageUrl } from "@/lib/image";
import { STATUS_META } from "../constants";
import { bannerLabel } from "../utils/bannerLabel";
import type { Banner } from "../types";

type BannerTableProps = {
  banners: Banner[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (banner: Banner) => void;
  onMove: (banner: Banner, direction: -1 | 1) => void;
  canDelete: boolean;
  canToggleStatus: boolean;
  canReorder: boolean;
  reordering: boolean;
  togglingId: string | null;
};

export function BannerTable({
  banners,
  loading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onMove,
  canDelete,
  canToggleStatus,
  canReorder,
  reordering,
  togglingId,
}: BannerTableProps) {
  // Move buttons act on carousel position, which is the order the rows are
  // already rendered in — so the first row can't move up and the last can't
  // move down. Disabled during a reorder so two clicks can't race.
  const lastIndex = banners.length - 1;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-300">All banners</p>
        <div className="flex items-center gap-3">
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title, alt, ID…"
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
              <th className="px-4 py-2 font-medium">Preview</th>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Alt text</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No banners match.
                </td>
              </tr>
            ) : (
              banners.map((banner, index) => {
                const status = STATUS_META[banner.status];
                const label = bannerLabel(banner);

                return (
                  <tr key={banner._id} className="border-t border-slate-800/80 hover:bg-slate-900/60">
                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="w-6 font-mono text-[11px] text-slate-500">
                          {banner.sortOrder}
                        </span>
                        {canReorder && (
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => onMove(banner, -1)}
                              disabled={reordering || index === 0}
                              className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                              aria-label={`Move ${label} up`}
                            >
                              <ArrowUp className="h-3 w-3" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => onMove(banner, 1)}
                              disabled={reordering || index === lastIndex}
                              className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                              aria-label={`Move ${label} down`}
                            >
                              <ArrowDown className="h-3 w-3" aria-hidden />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <img
                        src={banner.image ? getImageUrl(banner.image) : "/logo-transparent.webp"}
                        alt={label}
                        className="h-10 w-20 rounded-md border border-slate-700 bg-slate-950/60 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.3";
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 align-middle">
                      {banner.title ? (
                        <span className="text-slate-50">{banner.title}</span>
                      ) : (
                        <span className="italic text-slate-600">Untitled</span>
                      )}
                    </td>
                    <td className="max-w-[16rem] truncate px-4 py-2 align-middle">
                      {banner.alt ? (
                        <span className="text-slate-400">{banner.alt}</span>
                      ) : (
                        <span className="italic text-slate-600">Decorative</span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        {canToggleStatus && (
                          <button
                            type="button"
                            onClick={() => onToggleStatus(banner)}
                            disabled={togglingId === banner._id}
                            className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                          >
                            {banner.status === "active" ? "Disable" : "Enable"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEdit(banner)}
                          className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(banner._id)}
                            className="rounded-md border border-red-600/70 px-2 py-1 text-[11px] text-red-300 hover:bg-red-950"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
