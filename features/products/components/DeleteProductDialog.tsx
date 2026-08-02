// features/products/components/DeleteProductDialog.tsx
"use client";

import { useEffect, useRef } from "react";
import { pickLocale } from "@/lib/locale";
import type { Product } from "../types";

type DeleteProductDialogProps = {
  product: Product | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: (id: string) => void;
};

export function DeleteProductDialog({ product, deleting, onCancel, onConfirm }: DeleteProductDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;

    cancelBtnRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      // Minimal focus trap: keep Tab cycling within the dialog.
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [product, onCancel]);

  if (!product) return null;

  const productName = pickLocale(product.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-title"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="delete-product-title" className="text-sm font-semibold text-slate-50">
          Delete product
        </h3>
        <p className="mt-2 text-xs text-slate-400">
          Delete &ldquo;{productName}&rdquo;? This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product._id)}
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