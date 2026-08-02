// features/homepage-sections/components/SectionProductsEditor.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, X } from "lucide-react";
import { getImageUrl } from "@/lib/image";
import { useSaveSectionProducts } from "../hooks/useHomepageSectionMutations";
import { ProductPickerDialog } from "./ProductPickerDialog";
import type { HomepageSectionDetail, SectionProduct } from "../types";

type SectionProductsEditorProps = {
  /**
   * Mount this with a key that includes the section's `updatedAt`. A save
   * refetches and remounts, which reseeds the draft from the server copy —
   * a background refetch that changed nothing leaves in-progress edits alone.
   */
  section: HomepageSectionDetail;
  canManageProducts: boolean;
  onClose: () => void;
};

function sameOrder(a: SectionProduct[], b: SectionProduct[]) {
  return a.length === b.length && a.every((item, i) => item._id === b[i]._id);
}

export function SectionProductsEditor({
  section,
  canManageProducts,
  onClose,
}: SectionProductsEditorProps) {
  const saved = section.products;
  const [draft, setDraft] = useState<SectionProduct[]>(saved);
  const [pickerOpen, setPickerOpen] = useState(false);
  const saveProducts = useSaveSectionProducts();

  const dirty = !sameOrder(draft, saved);

  // Warn before a reload drops unsaved curation.
  useEffect(() => {
    if (!dirty) return;

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.length) return;

    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  }

  function remove(id: string) {
    setDraft((prev) => prev.filter((p) => p._id !== id));
  }

  function save() {
    // Only the ordered ObjectIds go over the wire — the product documents in
    // `draft` are display data read from the Products collection.
    saveProducts.mutate({
      id: section._id,
      products: draft.map((p) => p._id),
    });
  }

  const limit = section.limit;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
            {section.title} · products
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {draft.length} curated · the first {limit} render on the homepage,
            in this order.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageProducts && (
            <>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add products
              </button>
              <button
                type="button"
                onClick={() => setDraft(saved)}
                disabled={!dirty || saveProducts.isPending}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saveProducts.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white disabled:opacity-50"
              >
                {saveProducts.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                )}
                Save products
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>

      {draft.length === 0 ? (
        <p className="py-10 text-center text-xs text-slate-500">
          No products in this section yet.
          {canManageProducts && " Use “Add products” to pick some."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-800/80">
          {draft.map((product, index) => {
            const beyondLimit = index >= limit;
            const hidden = product.status && product.status !== "active";
            const label = product.name.fr || product.name.en || product._id;

            return (
              <li
                key={product._id}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <span className="w-6 shrink-0 font-mono text-[11px] text-slate-500">
                  {index + 1}
                </span>

                {canManageProducts && (
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                      aria-label={`Move ${label} up`}
                    >
                      <ArrowUp className="h-3 w-3" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === draft.length - 1}
                      className="rounded border border-slate-700 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                      aria-label={`Move ${label} down`}
                    >
                      <ArrowDown className="h-3 w-3" aria-hidden />
                    </button>
                  </div>
                )}

                <img
                  src={getImageUrl(product.images?.[0])}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-md border border-slate-700 bg-slate-950 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-slate-100">{label}</p>
                  <p className="text-[10px] text-slate-500">
                    {product.price} · stock {product.quantity ?? 0}
                  </p>
                </div>

                {hidden && (
                  <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    {product.status} — hidden on storefront
                  </span>
                )}

                {beyondLimit && (
                  <span className="shrink-0 rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    Beyond limit
                  </span>
                )}

                {canManageProducts && (
                  <button
                    type="button"
                    onClick={() => remove(product._id)}
                    className="shrink-0 rounded border border-slate-700 p-1 text-slate-400 hover:bg-slate-800 hover:text-red-300"
                    aria-label={`Remove ${label}`}
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {dirty && canManageProducts && (
        <p className="border-t border-slate-800 px-4 py-2 text-[11px] text-amber-400">
          Unsaved changes.
        </p>
      )}

      {pickerOpen && (
        <ProductPickerDialog
          selected={draft}
          onCancel={() => setPickerOpen(false)}
          onConfirm={(next) => {
            setDraft(next);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
