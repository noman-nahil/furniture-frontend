// features/homepage-sections/components/HomepageSectionFormModal.tsx
"use client";

import { useEffect } from "react";
import { slugify } from "@/lib/slug";
import { MAX_SECTION_LIMIT } from "../constants";
import type { useHomepageSectionForm } from "../hooks/useHomepageSectionForm";
import type {
  HomepageSectionStatusKey,
  HomepageSectionTypeOption,
} from "../types";

type HomepageSectionFormModalProps = {
  formState: ReturnType<typeof useHomepageSectionForm>;
  /** Types an admin may still create — those already in use are filtered out. */
  availableTypes: HomepageSectionTypeOption[];
};

export function HomepageSectionFormModal({
  formState,
  availableTypes,
}: HomepageSectionFormModalProps) {
  const {
    open,
    form,
    editingId,
    error,
    saving,
    handleChange,
    selectType,
    handleSubmit,
    close,
  } = formState;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close section form"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
      >
        <h3 className="text-sm font-semibold text-slate-50">
          {editingId ? "Edit section" : "New homepage section"}
        </h3>
        <p className="mt-1 text-[11px] text-slate-500">
          Active sections render on the homepage in sort order. Products are
          curated separately.
        </p>

        {error && (
          <p className="mt-3 rounded-md border border-red-900/70 bg-red-950/40 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {!editingId && (
            <div>
              <label
                htmlFor="section-type"
                className="mb-1 block text-xs font-medium text-slate-200"
              >
                Section type
              </label>
              <select
                id="section-type"
                value={form.sectionType}
                onChange={(e) =>
                  selectType(
                    availableTypes.find((t) => t.key === e.target.value) ?? null,
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
              >
                <option value="">Select a type…</option>
                {availableTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-500">
                {availableTypes.length === 0
                  ? "Every released section type already exists — edit the existing one instead."
                  : "Each type is a single system section and cannot be created twice."}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="section-title"
              className="mb-1 block text-xs font-medium text-slate-200"
            >
              Title
            </label>
            <input
              id="section-title"
              type="text"
              value={form.title}
              onChange={(e) => {
                handleChange("title", e.target.value);
                if (!editingId) handleChange("slug", slugify(e.target.value));
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Featured Products"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Heading shown above the section on the storefront.
            </p>
          </div>

          <div>
            <label
              htmlFor="section-slug"
              className="mb-1 block text-xs font-medium text-slate-200"
            >
              Slug
            </label>
            <input
              id="section-slug"
              type="text"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="featured-products"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Leave blank to derive it from the title. A taken slug gets a
              numeric suffix.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="section-sort-order"
                className="mb-1 block text-xs font-medium text-slate-200"
              >
                Sort order
              </label>
              <input
                id="section-sort-order"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
                placeholder="Auto"
              />
            </div>

            <div>
              <label
                htmlFor="section-limit"
                className="mb-1 block text-xs font-medium text-slate-200"
              >
                Limit
              </label>
              <input
                id="section-limit"
                type="number"
                min={1}
                max={MAX_SECTION_LIMIT}
                value={form.limit}
                onChange={(e) => handleChange("limit", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
                placeholder="Auto"
              />
            </div>

            <div>
              <label
                htmlFor="section-status"
                className="mb-1 block text-xs font-medium text-slate-200"
              >
                Status
              </label>
              <select
                id="section-status"
                value={form.status}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value as HomepageSectionStatusKey,
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-1 focus:ring-slate-300"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <p className="text-[10px] text-slate-500">
            Limit caps how many curated products render. The section can hold
            more as spares.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
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
    </div>
  );
}
