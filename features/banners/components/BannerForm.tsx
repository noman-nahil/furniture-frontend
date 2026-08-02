// features/banners/components/BannerForm.tsx
"use client";

import type { useBannerForm } from "../hooks/useBannerForm";
import { BannerImageUploader } from "./BannerImageUploader";
import type { BannerStatusKey } from "../types";

type BannerFormProps = {
  formState: ReturnType<typeof useBannerForm>;
};

export function BannerForm({ formState }: BannerFormProps) {
  const {
    form,
    editingId,
    error,
    saving,
    existingImage,
    imageUploader,
    handleChange,
    handleSubmit,
    resetForm,
  } = formState;

  return (
    <div className="h-fit rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4">
      <p className="mb-1 text-xs font-medium text-slate-200">
        {editingId ? "Edit banner" : "Create banner"}
      </p>
      <p className="mb-3 text-[11px] text-slate-500">
        Active banners appear in the storefront hero carousel, lowest sort order first.
      </p>

      {error && (
        <p className="mb-3 rounded-md border border-red-900/70 bg-red-950/40 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-200">Image</label>
          <BannerImageUploader
            staged={imageUploader.staged}
            removeExisting={imageUploader.removeExisting}
            existingImage={existingImage}
            onFile={imageUploader.setFile}
            onClearStaged={imageUploader.clear}
            onMarkRemoveExisting={imageUploader.markRemoveExisting}
            onUndoRemoveExisting={imageUploader.undoRemoveExisting}
          />
        </div>

        <div>
          <label htmlFor="banner-title" className="mb-1 block text-xs font-medium text-slate-200">
            Title <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="banner-title"
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="Spring collection"
          />
          <p className="mt-1 text-[10px] text-slate-500">
            Internal label — only shown here, never on the storefront.
          </p>
        </div>

        <div>
          <label htmlFor="banner-alt" className="mb-1 block text-xs font-medium text-slate-200">
            Alt text <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="banner-alt"
            type="text"
            value={form.alt}
            onChange={(e) => handleChange("alt", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="Featured collection — spring sofas"
          />
          <p className="mt-1 text-[10px] text-slate-500">
            Read aloud by screen readers. Falls back to the title, or leave both
            empty for a purely decorative banner.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="banner-sort-order" className="mb-1 block text-xs font-medium text-slate-200">
              Sort order
            </label>
            <input
              id="banner-sort-order"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => handleChange("sortOrder", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Auto"
            />
          </div>

          <div>
            <label htmlFor="banner-status" className="mb-1 block text-xs font-medium text-slate-200">
              Status
            </label>
            <select
              id="banner-status"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as BannerStatusKey)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
