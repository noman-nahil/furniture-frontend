"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type ProductRowMenuProps = {
  productId: string;
  productName: string;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProductRowMenu({
  productId,
  productName,
  canDelete,
  onEdit,
  onDelete,
}: ProductRowMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();
  const firstItemRef = useRef<HTMLButtonElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();
  }, [open]);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(productId);
    } catch {
      // ignore — clipboard may be unavailable
    }
    setOpen(false);
  }

  const menuPanel = (
    <div
      ref={refs.setFloating}
      id={menuId}
      style={{ ...floatingStyles, zIndex: 50 }}
      {...getFloatingProps()}
      className="min-w-[168px] rounded-lg border border-slate-700/80 bg-slate-900 py-1 shadow-xl"
    >
      <button
        ref={firstItemRef}
        type="button"
        role="menuitem"
        onClick={() => {
          setOpen(false);
          onEdit();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
      >
        <Pencil className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        Edit
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => void copyId()}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
      >
        <Copy className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        Copy ID
      </button>
      {canDelete && (
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-300 hover:bg-red-950/50 focus:bg-red-950/50 focus:outline-none"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Delete
        </button>
      )}
    </div>
  );

  return (
    <div className="flex shrink-0 justify-end">
      <button
        ref={refs.setReference}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Actions for ${productName}`}
        {...getReferenceProps()}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>

      {mounted && open && createPortal(menuPanel, document.body)}
    </div>
  );
}
