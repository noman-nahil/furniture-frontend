// features/banners/components/DeleteBannerDialog.tsx
"use client";

import { bannerLabel } from "../utils/bannerLabel";
import type { Banner } from "../types";

type DeleteBannerDialogProps = {
  banner: Banner | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: (id: string) => void;
};

export function DeleteBannerDialog({
  banner,
  deleting,
  onCancel,
  onConfirm,
}: DeleteBannerDialogProps) {
  if (!banner) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-50">Delete banner</h3>
        <p className="mt-2 text-xs text-slate-400">
          Delete &ldquo;{bannerLabel(banner)}&rdquo;? The image is removed from storage too. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(banner._id)}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
