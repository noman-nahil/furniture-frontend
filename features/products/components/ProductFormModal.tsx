"use client";

import { useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";
import { ProductForm } from "./ProductForm";
import type { useProductForm } from "../hooks/useProductForm";
import type { Category, Subcategory } from "../types";

export const PRODUCT_FORM_ID = "product-form";

type ProductFormModalProps = {
  open: boolean;
  onClose: () => void;
  formState: ReturnType<typeof useProductForm>;
  categories: Category[];
  subcategories: Subcategory[];
};

export function ProductFormModal({
  open,
  onClose,
  formState,
  categories,
  subcategories,
}: ProductFormModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { editingId, duplicatingFromId, saving } = formState;

  const title = editingId
    ? "Edit Product"
    : duplicatingFromId
      ? "Duplicate Product"
      : "Create Product";
  const submitLabel = saving
    ? editingId
      ? "Saving…"
      : "Creating…"
    : editingId
      ? "Save Product"
      : duplicatingFromId
        ? "Create Copy"
        : "Save Product";

  // Focus the close button only when the modal opens — not on every
  // parent re-render. Depending on `onClose` here used to re-run this
  // effect after each keystroke (unstable callback identity) and steal
  // focus from the field the admin was typing in.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (justOpened) {
      closeBtnRef.current?.focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close product form"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-modal-title"
        className="relative flex h-full w-full max-h-none flex-col border-slate-800 bg-slate-950 shadow-2xl sm:h-[min(92vh,980px)] sm:max-w-[1280px] sm:rounded-xl sm:border lg:max-w-[1360px]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-5 py-3">
          <h2 id="product-form-modal-title" className="text-sm font-semibold text-slate-50 sm:text-base">
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          <ProductForm
            embedded
            formId={PRODUCT_FORM_ID}
            formState={formState}
            categories={categories}
            subcategories={subcategories}
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-800 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={PRODUCT_FORM_ID}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-white disabled:opacity-70"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
