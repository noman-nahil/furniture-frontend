"use client";

import { useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";
import { SubcategoryForm } from "./SubcategoryForm";
import type { useSubcategoryForm } from "../hooks/useSubcategoryForm";
import type { Category } from "../types";

export const SUBCATEGORY_FORM_ID = "subcategory-form";

type SubcategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  formState: ReturnType<typeof useSubcategoryForm>;
  categories: Category[];
};

export function SubcategoryFormModal({
  open,
  onClose,
  formState,
  categories,
}: SubcategoryFormModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const { editingId, saving } = formState;

  const title = editingId ? "Edit Subcategory" : "Create Subcategory";

  onCloseRef.current = onClose;

  // Initial focus only when the modal opens — not when parent callbacks change.
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
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
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close subcategory form"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subcategory-form-modal-title"
        className="relative flex h-full w-full max-h-none flex-col border-slate-800 bg-slate-950 shadow-2xl sm:h-auto sm:max-h-[min(90vh,900px)] sm:max-w-[960px] sm:rounded-xl sm:border"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <h2 id="subcategory-form-modal-title" className="text-base font-semibold text-slate-50 sm:text-lg">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <SubcategoryForm
            formId={SUBCATEGORY_FORM_ID}
            formState={formState}
            categories={categories}
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={SUBCATEGORY_FORM_ID}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-white disabled:opacity-70"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {saving ? "Saving…" : "Save Subcategory"}
          </button>
        </div>
      </div>
    </div>
  );
}
