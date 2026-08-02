// features/products/components/BulkActionBar.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import type { StatusKey } from "../types";

type BulkActionBarProps = {
  selectedCount: number;
  canBulkDelete: boolean;
  onClearSelection: () => void;
  onApplyUpdate: (payload: {
    discount?: number;
    discountPrice?: number;
    status?: StatusKey;
    discountStartsAt?: string;
    discountEndsAt?: string;
  }) => Promise<void> | void;
  onBulkDelete: () => void;
  loading: boolean;
};

type ExpandedPanel = "discount" | "delete" | null;

export function BulkActionBar({
  selectedCount,
  canBulkDelete,
  onClearSelection,
  onApplyUpdate,
  onBulkDelete,
  loading,
}: BulkActionBarProps) {
  const [expanded, setExpanded] = useState<ExpandedPanel>(null);
  const [discount, setDiscount] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [status, setStatus] = useState<StatusKey | "">("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCount === 0) {
      setExpanded(null);
      setError(null);
    }
  }, [selectedCount]);

  if (selectedCount === 0) return null;

  function resetDiscountFields() {
    setDiscount("");
    setDiscountPrice("");
    setStatus("");
    setStartsAt("");
    setEndsAt("");
    setError(null);
  }

  function handleClear() {
    resetDiscountFields();
    setExpanded(null);
    onClearSelection();
  }

  async function handleApplyDiscount() {
    setError(null);
    const percent = discount ? Number(discount) : undefined;
    const fixedPrice = discountPrice ? Number(discountPrice) : undefined;

    if (percent != null && fixedPrice != null) {
      setError("Choose either discount % or fixed price, not both.");
      return;
    }
    if (percent == null && fixedPrice == null && !status) {
      setError("Enter a discount or select a status.");
      return;
    }
    if (percent != null && (Number.isNaN(percent) || percent < 0 || percent > 100)) {
      setError("Discount % must be between 0 and 100.");
      return;
    }
    if (fixedPrice != null && (Number.isNaN(fixedPrice) || fixedPrice < 0)) {
      setError("Fixed price must be zero or greater.");
      return;
    }

    await onApplyUpdate({
      discount: percent,
      discountPrice: fixedPrice,
      status: status || undefined,
      discountStartsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      discountEndsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
    });

    resetDiscountFields();
    setExpanded(null);
  }

  async function handleQuickStatus(next: StatusKey | "") {
    if (!next) return;
    setError(null);
    await onApplyUpdate({ status: next });
    setExpanded(null);
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-6"
      role="region"
      aria-label="Bulk product actions"
    >
      <div className="pointer-events-auto w-full max-w-3xl">
        {expanded === "discount" && (
          <div className="mb-2 rounded-xl border border-slate-700/80 bg-slate-900 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-100">Bulk update</p>
              <button
                type="button"
                onClick={() => {
                  setExpanded(null);
                  setError(null);
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                aria-label="Close bulk update panel"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block text-xs text-slate-300">
                Discount %
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(e.target.value);
                    setDiscountPrice("");
                  }}
                  placeholder="0–100"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-xs text-slate-300">
                Fixed discount price
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => {
                    setDiscountPrice(e.target.value);
                    setDiscount("");
                  }}
                  placeholder="e.g. 19.99"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-xs text-slate-300">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusKey | "")}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                >
                  <option value="">No change</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="block text-xs text-slate-300">
                Discount starts (optional)
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-xs text-slate-300 sm:col-span-2 lg:col-span-2">
                Discount ends (optional)
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
            <button
              type="button"
              onClick={handleApplyDiscount}
              disabled={loading}
              className="mt-4 flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
              {loading ? "Applying…" : "Apply updates"}
            </button>
          </div>
        )}

        {expanded === "delete" && (
          <div className="mb-2 rounded-xl border border-red-900/60 bg-slate-900 p-4 shadow-2xl">
            <p className="text-sm text-red-200">
              Permanently delete {selectedCount} product{selectedCount === 1 ? "" : "s"}? This cannot be undone.
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
          <p className="mr-1 text-sm font-medium text-slate-100">
            {selectedCount} selected
          </p>

          <select
            value=""
            onChange={(e) => void handleQuickStatus(e.target.value as StatusKey | "")}
            disabled={loading}
            aria-label="Set status for selected products"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500 disabled:opacity-60"
          >
            <option value="">Set status…</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          <button
            type="button"
            disabled={loading}
            onClick={() => setExpanded(expanded === "discount" ? null : "discount")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
          >
            <Tag className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            Edit discount…
          </button>

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
