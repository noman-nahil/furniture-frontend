// features/products/components/DuplicateProductDialog.tsx
"use client";

import { useEffect, useRef } from "react";
import { pickLocale } from "@/lib/locale";
import type { Product } from "../types";

type DuplicateProductDialogProps = {
  product: Product | null;
  duplicating: boolean;
  onCancel: () => void;
  onConfirm: (id: string) => void;
};

export function DuplicateProductDialog({
  product,
  duplicating,
  onCancel,
  onConfirm,
}: DuplicateProductDialogProps) {
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
      aria-labelledby="duplicate-product-title"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="duplicate-product-title" className="text-sm font-semibold text-slate-50">
          Duplicate Product?
        </h3>
        <p className="mt-2 text-xs text-slate-300">
          Product: <span className="font-medium text-slate-100">{productName}</span>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          This will create a new active product using the existing product information and images.
          You can change the name and slug after duplicating.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={duplicating}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product._id)}
            disabled={duplicating}
            className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
          >
            {duplicating ? "Duplicating…" : "Duplicate"}
          </button>
        </div>
      </div>
    </div>
  );
}
