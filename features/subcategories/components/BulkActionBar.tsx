// features/subcategories/components/BulkActionBar.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type BulkActionBarProps = {
  selectedCount: number;
  canBulkDelete: boolean;
  onClearSelection: () => void;
  onApplyUpdate: (payload: { isActive?: boolean }) => Promise<void> | void;
  onBulkDelete: () => void;
  loading: boolean;
};

type ExpandedPanel = "delete" | null;

export function BulkActionBar({
  selectedCount,
  canBulkDelete,
  onClearSelection,
  onApplyUpdate,
  onBulkDelete,
  loading,
}: BulkActionBarProps) {
  const [expanded, setExpanded] = useState<ExpandedPanel>(null);

  useEffect(() => {
    if (selectedCount === 0) setExpanded(null);
  }, [selectedCount]);

  if (selectedCount === 0) return null;

  function handleClear() {
    setExpanded(null);
    onClearSelection();
  }

  async function handleQuickStatus(next: string) {
    if (!next) return;
    await onApplyUpdate({ isActive: next === "active" });
    setExpanded(null);
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-6"
      role="region"
      aria-label="Bulk subcategory actions"
    >
      <div className="pointer-events-auto w-full max-w-3xl">
        {expanded === "delete" && (
          <div className="mb-2 rounded-xl border border-red-900/60 bg-slate-900 p-4 shadow-2xl">
            <p className="text-sm text-red-200">
              Permanently delete {selectedCount} subcategor{selectedCount === 1 ? "y" : "ies"}? This
              cannot be undone.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Any subcategory that still has products linked to it will be skipped by the server.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setExpanded(null)}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setExpanded(null);
                  onBulkDelete();
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {loading ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md">
          <p className="mr-1 text-sm font-medium text-slate-100">{selectedCount} selected</p>

          <select
            value=""
            onChange={(e) => void handleQuickStatus(e.target.value)}
            disabled={loading}
            aria-label="Set status for selected subcategories"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500 disabled:opacity-60"
          >
            <option value="">Set status…</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {canBulkDelete && (
            <button
              type="button"
              disabled={loading}
              onClick={() => setExpanded(expanded === "delete" ? null : "delete")}
              className="rounded-lg border border-red-800/60 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950/50 disabled:opacity-60"
            >
              Delete
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
