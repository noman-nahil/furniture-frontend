// features/categories/CategoriesManagement.tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROLE_PERMISSIONS } from "./constants";
import { useCategoriesQuery } from "./hooks/useCategories";
import { useCategoryForm } from "./hooks/useCategoryForm";
import { categoriesApi } from "./api/categoriesApi";
import { CategoryTable } from "./components/CategoryTable";
import type { CategoriesManagementRole, Category } from "./types";

const CategoryForm = dynamic(
  () => import("./components/CategoryForm").then((mod) => mod.CategoryForm),
  {
    loading: () => (
      <div className="h-fit animate-pulse rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4">
        <div className="mb-3 h-3 w-24 rounded bg-slate-800" />
        <div className="space-y-3">
          <div className="h-8 rounded-lg bg-slate-900" />
          <div className="h-8 rounded-lg bg-slate-900" />
          <div className="h-28 w-28 rounded-xl bg-slate-900" />
        </div>
      </div>
    ),
  },
);

type CategoriesManagementProps = {
  title?: string;
  description?: string;
  /** Controls which destructive actions are available. Defaults to "admin". */
  role?: CategoriesManagementRole;
};

export function CategoriesManagement({
  title = "Categories",
  description = "Add, edit, or remove product categories. Slug is used in URLs.",
  role = "admin",
}: CategoriesManagementProps) {
  const permissions = ROLE_PERMISSIONS[role];
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const formState = useCategoryForm();
  const qc = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      if (formState.editingId === id) formState.resetForm();
      toast.success("Category deleted.");
      setConfirmDeleteId(null);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
      setConfirmDeleteId(null);
    },
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return categories;
    return categories.filter(
      (c: Category) =>
        c.name.toLowerCase().includes(normalizedQuery) ||
        c.slug.toLowerCase().includes(normalizedQuery) ||
        c._id.toLowerCase().includes(normalizedQuery)
    );
  }, [categories, normalizedQuery]);

  const pendingDelete =
    permissions.canDelete && confirmDeleteId
      ? categories.find((c: Category) => c._id === confirmDeleteId)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        {permissions.canCreate && (
          <button
            type="button"
            onClick={formState.resetForm}
            className="shrink-0 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            New category
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <CategoryTable
          categories={filtered}
          loading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={formState.startEdit}
          onDelete={setConfirmDeleteId}
          canDelete={permissions.canDelete}
        />
        <CategoryForm formState={formState} />
      </div>

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-slate-50">Delete category</h3>
            <p className="mt-2 text-xs text-slate-400">
              Delete &ldquo;{pendingDelete.name}&rdquo;? Products may still reference it. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(pendingDelete._id)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
