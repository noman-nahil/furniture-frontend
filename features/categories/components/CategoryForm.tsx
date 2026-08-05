// features/categories/components/CategoryForm.tsx

import type { useCategoryForm } from "../hooks/useCategoryForm";
import { CategoryImageUploader } from "./CategoryImageUploader";
import { slugify } from "@/lib/slug";

type CategoryFormProps = {
  formState: ReturnType<typeof useCategoryForm>;
};

export function CategoryForm({ formState }: CategoryFormProps) {
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
        {editingId ? "Edit category" : "Create category"}
      </p>
      <p className="mb-3 text-[11px] text-slate-500">Slug auto-fills from the name if left empty.</p>

      {error && (
        <p className="mb-3 rounded-md border border-red-900/70 bg-red-950/40 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="category-name" className="mb-1 block text-xs font-medium text-slate-200">
            Name
          </label>
          <input
            id="category-name"
            type="text"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              handleChange("name", name);
              if (!editingId) handleChange("slug", slugify(name));
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="Living room"
          />
        </div>

        <div>
          <label htmlFor="category-slug" className="mb-1 block text-xs font-medium text-slate-200">
            Slug
          </label>
          <input
            id="category-slug"
            type="text"
            value={form.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="living-room"
          />
        </div>

        <div>
          <label htmlFor="category-sort-order" className="mb-1 block text-xs font-medium text-slate-200">
            Sort order
          </label>
          <input
            id="category-sort-order"
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => handleChange("sortOrder", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="Auto (append)"
          />
          <p className="mt-1 text-[10px] text-slate-500">
            Lower numbers appear first in the navbar. Leave blank to append.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-200">Image</label>
          <CategoryImageUploader
            staged={imageUploader.staged}
            removeExisting={imageUploader.removeExisting}
            existingImage={existingImage}
            onFile={imageUploader.setFile}
            onClearStaged={imageUploader.clear}
            onMarkRemoveExisting={imageUploader.markRemoveExisting}
            onUndoRemoveExisting={imageUploader.undoRemoveExisting}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            className="rounded border-slate-600"
          />
          Active (visible on storefront when using active lists)
        </label>

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