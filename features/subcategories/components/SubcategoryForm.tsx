// features/subcategories/components/SubcategoryForm.tsx
"use client";

import { SubcategoryFormSection } from "./SubcategoryFormSection";
import { SubcategoryImageUploader } from "./SubcategoryImageUploader";
import type { useSubcategoryForm } from "../hooks/useSubcategoryForm";
import type { Category } from "../types";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none placeholder-slate-500 focus:ring-1 focus:ring-slate-300";

type SubcategoryFormProps = {
  formState: ReturnType<typeof useSubcategoryForm>;
  categories: Category[];
  /** Associates the external submit button in the modal footer. */
  formId?: string;
};

export function SubcategoryForm({ formState, categories, formId }: SubcategoryFormProps) {
  const {
    form,
    editingId,
    error,
    existingImage,
    existingSlug,
    imageUploader,
    handleChange,
    handleSubmit,
  } = formState;

  return (
    <div>
      {error && (
        <p className="rounded-md border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        <SubcategoryFormSection
          title="Basic Information"
          description="The display name shown across the storefront and admin catalog."
        >
          <div>
            <label htmlFor="subcategory-name" className="mb-1 block text-xs font-medium text-slate-200">
              Name <span className="text-slate-500">— required</span>
            </label>
            <input
              id="subcategory-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputClass}
              placeholder="Sofas"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            {editingId && existingSlug ? (
              <>
                URL slug: <span className="font-mono text-slate-400">{existingSlug}</span> — regenerated
                by the server when the name changes.
              </>
            ) : (
              "The URL slug is generated from the name by the server."
            )}
          </p>
        </SubcategoryFormSection>

        <SubcategoryFormSection
          title="Taxonomy"
          description="Every subcategory belongs to exactly one parent category."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="subcategory-parent-category"
                className="mb-1 block text-xs font-medium text-slate-200"
              >
                Parent category <span className="text-slate-500">— required</span>
              </label>
              <select
                id="subcategory-parent-category"
                value={form.parentCategory}
                onChange={(e) => handleChange("parentCategory", e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subcategory-status" className="mb-1 block text-xs font-medium text-slate-200">
                Status
              </label>
              <select
                id="subcategory-status"
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => handleChange("isActive", e.target.value === "active")}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Inactive subcategories stay hidden from the storefront.
              </p>
            </div>
          </div>
        </SubcategoryFormSection>

        <SubcategoryFormSection title="Image" description="Upload a banner directly to Cloudflare R2.">
          <SubcategoryImageUploader
            staged={imageUploader.staged}
            removeExisting={imageUploader.removeExisting}
            existingImage={existingImage}
            onFile={imageUploader.setFile}
            onClearStaged={imageUploader.clear}
            onMarkRemoveExisting={imageUploader.markRemoveExisting}
            onUndoRemoveExisting={imageUploader.undoRemoveExisting}
          />
        </SubcategoryFormSection>
      </form>
    </div>
  );
}
