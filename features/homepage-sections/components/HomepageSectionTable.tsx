// features/homepage-sections/components/HomepageSectionTable.tsx
"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { STATUS_META } from "../constants";
import type {
  HomepageSectionSummary,
  HomepageSectionTypeOption,
} from "../types";

type HomepageSectionTableProps = {
  sections: HomepageSectionSummary[];
  sectionTypes: HomepageSectionTypeOption[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (section: HomepageSectionSummary) => void;
  onEdit: (section: HomepageSectionSummary) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (section: HomepageSectionSummary) => void;
  onMove: (section: HomepageSectionSummary, direction: -1 | 1) => void;
  canEditDetails: boolean;
  canDelete: boolean;
  canToggleStatus: boolean;
  canReorder: boolean;
  reordering: boolean;
  togglingId: string | null;
};

export function HomepageSectionTable({
  sections,
  sectionTypes,
  loading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  onMove,
  canEditDetails,
  canDelete,
  canToggleStatus,
  canReorder,
  reordering,
  togglingId,
}: HomepageSectionTableProps) {
  const lastIndex = sections.length - 1;
  const typeLabels = new Map(sectionTypes.map((t) => [t.key, t.label]));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
          Homepage sections
        </p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Section</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Products</th>
              <th className="px-4 py-2 font-medium">Shows</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No homepage sections yet.
                </td>
              </tr>
            ) : (
              sections.map((section, index) => {
                const status = STATUS_META[section.status];
                const isSelected = section._id === selectedId;

                return (
                  <tr
                    key={section._id}
                    className={`border-t border-slate-800/80 ${
                      isSelected ? "bg-slate-900" : "hover:bg-slate-900/60"
                    }`}
                  >
                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="w-6 font-mono text-[11px] text-slate-500">
                          {section.sortOrder}
                        </span>
                        {canReorder && (
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => onMove(section, -1)}
                              disabled={reordering || index === 0}
                              className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                              aria-label={`Move ${section.title} up`}
                            >
                              <ArrowUp className="h-3 w-3" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => onMove(section, 1)}
                              disabled={reordering || index === lastIndex}
                              className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                              aria-label={`Move ${section.title} down`}
                            >
                              <ArrowDown className="h-3 w-3" aria-hidden />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <span className="text-slate-50">{section.title}</span>
                      <span className="block font-mono text-[10px] text-slate-500">
                        /{section.slug}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-middle text-slate-400">
                      {typeLabels.get(section.sectionType) ?? section.sectionType}
                    </td>
                    <td className="px-4 py-2 align-middle tabular-nums">
                      {section.productCount}
                    </td>
                    <td className="px-4 py-2 align-middle tabular-nums text-slate-400">
                      {Math.min(section.productCount, section.limit)} of {section.limit}
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          aria-hidden
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onSelect(section)}
                          className={`rounded-md border px-2 py-1 text-[11px] ${
                            isSelected
                              ? "border-slate-400 bg-slate-800 text-white"
                              : "border-slate-700 text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          {isSelected ? "Editing products" : "Manage products"}
                        </button>
                        {canToggleStatus && (
                          <button
                            type="button"
                            onClick={() => onToggleStatus(section)}
                            disabled={togglingId === section._id}
                            className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                          >
                            {section.status === "active" ? "Disable" : "Enable"}
                          </button>
                        )}
                        {canEditDetails && (
                          <button
                            type="button"
                            onClick={() => onEdit(section)}
                            className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(section._id)}
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
