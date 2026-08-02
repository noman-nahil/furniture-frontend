// features/subcategories/SubcategoriesManagement.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE, ROLE_PERMISSIONS } from "./constants";
import { useCategoriesQuery, useSubcategoriesQuery } from "./hooks/useSubcategories";
import { useSubcategoryForm } from "./hooks/useSubcategoryForm";
import { useBulkDelete, useBulkUpdate, useDeleteSubcategory } from "./hooks/useBulkUpdate";
import { selectSubcategoryPage } from "./utils/subcategoryFilters";
import { SubcategoryTable } from "./components/SubcategoryTable";
import { SubcategoryFiltersToolbar } from "./components/SubcategoryFiltersToolbar";
import { SubcategoryFormModal } from "./components/SubcategoryFormModal";
import { BulkActionBar } from "./components/BulkActionBar";
import { DeleteSubcategoryDialog } from "./components/DeleteSubcategoryDialog";
import type { Subcategory, SubcategoriesManagementRole, SubcategoryStatusFilter } from "./types";

type SubcategoriesManagementProps = {
  title?: string;
  description?: string;
  /** Controls which destructive/bulk actions are available. Defaults to "admin". */
  role?: SubcategoriesManagementRole;
};

export function SubcategoriesManagement({
  title = "Subcategories",
  description = "Organize the catalog under each parent category.",
  role = "admin",
}: SubcategoriesManagementProps) {
  const permissions = ROLE_PERMISSIONS[role];

  // ─── Filters / pagination ────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<SubcategoryStatusFilter>("ALL");
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => setPage(1), [searchQuery]);

  const filters = useMemo(
    () => ({ search: searchQuery, category: selectedCategory, status: selectedStatus }),
    [searchQuery, selectedCategory, selectedStatus],
  );

  // ─── Data ─────────────────────────────────────────────────────────────
  // The endpoint returns the whole taxonomy at once, so searching, filtering
  // and paging happen locally — no refetch per page, and therefore no need
  // for the stale-page snapshot the product list keeps.
  const { data: allSubcategories = [], isLoading, isFetching } = useSubcategoriesQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const result = useMemo(
    () => selectSubcategoryPage(allSubcategories, page, DEFAULT_PAGE_SIZE, filters),
    [allSubcategories, page, filters],
  );

  const subcategories = result.data;
  const total = result.total;
  const counts = result.statusCounts;

  // Deleting the last row of the last page can leave `page` past the end.
  useEffect(() => {
    if (result.page !== page) setPage(result.page);
  }, [result.page, page]);

  const stats = useMemo(
    () => ({
      totalSubcategories: counts?.total ?? 0,
      activeSubcategories: counts?.active ?? 0,
      inactiveSubcategories: counts?.inactive ?? 0,
    }),
    [counts],
  );

  function handleCategoryChange(value: string) {
    setPage(1);
    setSelectedCategory(value);
  }

  function handleStatusChange(value: SubcategoryStatusFilter) {
    setPage(1);
    setSelectedStatus(value);
  }

  function handleClearFilters() {
    setPage(1);
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStatus("ALL");
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCategory !== "" || selectedStatus !== "ALL";

  // ─── Form (modal) ─────────────────────────────────────────────────────
  const formState = useSubcategoryForm(useCallback(() => {
    setFormOpen(false);
  }, []));

  const { resetForm, startEdit } = formState;

  const closeFormAndReset = useCallback(() => {
    resetForm();
    setFormOpen(false);
  }, [resetForm]);

  const openCreateForm = useCallback(() => {
    resetForm();
    setFormOpen(true);
  }, [resetForm]);

  const openEditForm = useCallback(
    (subcategory: Subcategory) => {
      startEdit(subcategory);
      setFormOpen(true);
    },
    [startEdit],
  );

  // Warn on unload if the form has unsaved input.
  useEffect(() => {
    if (!formState.isDirty || !formOpen) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formState.isDirty, formOpen]);

  // ─── Mutations ────────────────────────────────────────────────────────
  const deleteSubcategory = useDeleteSubcategory();
  const bulkUpdate = useBulkUpdate();
  const bulkDelete = useBulkDelete();

  function toggleSubcategory(id: string) {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAllVisible() {
    const visibleIds = subcategories.map((s) => s._id);
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedSubcategoryIds.includes(id));
    setSelectedSubcategoryIds((prev) =>
      allSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds])),
    );
  }

  async function handleBulkApply(payload: { isActive?: boolean }) {
    await bulkUpdate.mutateAsync({ subcategoryIds: selectedSubcategoryIds, ...payload });
    setSelectedSubcategoryIds([]);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedSubcategoryIds);
    setSelectedSubcategoryIds([]);
  }

  const pendingDeleteSubcategory = confirmDeleteId
    ? subcategories.find((s) => s._id === confirmDeleteId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {stats.totalSubcategories > 0
              ? `${stats.totalSubcategories} subcategor${
                  stats.totalSubcategories === 1 ? "y" : "ies"
                } in catalog`
              : description}
          </p>
        </div>
        {permissions.canCreate && (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            Add subcategory
          </button>
        )}
      </div>

      <div
        className={`space-y-4 ${
          selectedSubcategoryIds.length > 0 && permissions.canBulkUpdate ? "pb-24" : ""
        }`}
      >
        <SubcategoryFiltersToolbar
          stats={stats}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          isFetching={isFetching}
          visibleCount={subcategories.length}
          filteredTotal={total}
        />

        <SubcategoryTable
          subcategories={subcategories}
          total={total}
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          isLoading={isLoading}
          isFetching={isFetching}
          categories={categories}
          selectedStatus={selectedStatus}
          selectedSubcategoryIds={selectedSubcategoryIds}
          hasActiveFilters={hasActiveFilters}
          canCreate={permissions.canCreate}
          onToggleSubcategory={toggleSubcategory}
          onToggleAllVisible={toggleAllVisible}
          onEdit={openEditForm}
          onDelete={setConfirmDeleteId}
          onAddSubcategory={openCreateForm}
          onClearFilters={handleClearFilters}
          canDelete={permissions.canDelete}
          onPageChange={setPage}
        />
      </div>

      {permissions.canBulkUpdate && (
        <BulkActionBar
          selectedCount={selectedSubcategoryIds.length}
          canBulkDelete={permissions.canBulkDelete}
          onClearSelection={() => setSelectedSubcategoryIds([])}
          onApplyUpdate={handleBulkApply}
          onBulkDelete={handleBulkDelete}
          loading={bulkUpdate.isPending || bulkDelete.isPending}
        />
      )}

      <SubcategoryFormModal
        open={formOpen}
        onClose={closeFormAndReset}
        formState={formState}
        categories={categories}
      />

      <DeleteSubcategoryDialog
        subcategory={pendingDeleteSubcategory}
        deleting={deleteSubcategory.isPending}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={(id) => {
          deleteSubcategory.mutate(id, {
            onSuccess: () => {
              setConfirmDeleteId(null);
              setSelectedSubcategoryIds((prev) => prev.filter((x) => x !== id));
            },
          });
        }}
      />
    </div>
  );
}
