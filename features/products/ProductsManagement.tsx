// features/products/ProductsManagement.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROLE_PERMISSIONS, DEFAULT_PAGE_SIZE } from "./constants";
import { useProductsQuery, useCategoriesQuery, useSubcategoriesQuery } from "./hooks/useProducts";
import { useProductForm } from "./hooks/useProductForm";
import {
  useBulkUpdate,
  useBulkDelete,
  useDeleteProduct,
} from "./hooks/useBulkUpdate";
import { productsApi } from "./api/productsApi";
import { ProductTable } from "./components/ProductTable";
import { ProductFiltersToolbar } from "./components/ProductFiltersToolbar";
import { ProductFormModal } from "./components/ProductFormModal";
import { BulkActionBar } from "./components/BulkActionBar";
import { DeleteProductDialog } from "./components/DeleteProductDialog";
import type { Product, ProductListResponse, ProductsManagementRole, StatusKey } from "./types";

type ProductsManagementProps = {
  title?: string;
  description?: string;
  /** Controls which destructive/bulk actions are available. Defaults to "admin". */
  role?: ProductsManagementRole;
};

function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function ProductsManagement({
  title = "Products",
  description = "Manage products, pricing and stock.",
  role = "admin",
}: ProductsManagementProps) {
  const permissions = ROLE_PERMISSIONS[role];
  const searchParams = useSearchParams();
  const router = useRouter();
  const deepLinkHandled = useRef(false);

  // ─── Filters / pagination ────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusKey | "ALL" | "DISCOUNTED">("ALL");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => setPage(1), [debouncedSearch]);

  const filters = useMemo(
    () => ({ search: debouncedSearch, category: selectedCategory, status: selectedStatus }),
    [debouncedSearch, selectedCategory, selectedStatus]
  );

  // ─── Data ─────────────────────────────────────────────────────────────
  const { data: productsResult, isLoading, isFetching } = useProductsQuery(page, DEFAULT_PAGE_SIZE, filters);
  const { data: categories = [] } = useCategoriesQuery();
  const { data: subcategories = [] } = useSubcategoriesQuery();

  const filterSignature = useMemo(
    () => `${debouncedSearch}\0${selectedCategory}\0${selectedStatus}`,
    [debouncedSearch, selectedCategory, selectedStatus],
  );

  // Keep the last successful page visible while paginating (same filters only).
  const lastSnapshotRef = useRef<ProductListResponse | null>(null);
  const snapshotFilterRef = useRef(filterSignature);
  if (productsResult) {
    lastSnapshotRef.current = productsResult;
    snapshotFilterRef.current = filterSignature;
  }
  const canUseStaleSnapshot =
    isFetching &&
    snapshotFilterRef.current === filterSignature &&
    lastSnapshotRef.current != null;
  const displayResult = productsResult ?? (canUseStaleSnapshot ? lastSnapshotRef.current : null);

  const products = displayResult?.data ?? [];
  const total = displayResult?.total ?? 0;
  const counts = displayResult?.statusCounts;

  const stats = useMemo(
    () => ({
      totalProducts: counts?.total ?? 0,
      activeProducts: counts?.active ?? 0,
      inactiveProducts: counts?.inactive ?? 0,
      draftProducts: counts?.draft ?? 0,
      discountedProducts: counts?.discounted ?? 0,
    }),
    [counts],
  );

  function handleCategoryChange(value: string) {
    setPage(1);
    setSelectedCategory(value);
  }

  function handleStatusChange(value: StatusKey | "ALL" | "DISCOUNTED") {
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
    debouncedSearch.trim() !== "" || selectedCategory !== "" || selectedStatus !== "ALL";

  // ─── Form (modal) ─────────────────────────────────────────────────────
  const formState = useProductForm(useCallback(() => {
    setFormOpen(false);
  }, []));

  // Depend on stable handlers from the hook — not the whole formState
  // object (new identity every keystroke) — so modal onClose stays stable.
  const { resetForm, startEdit, startDuplicate } = formState;

  const closeFormAndReset = useCallback(() => {
    resetForm();
    setFormOpen(false);
    if (searchParams.get("edit")) {
      router.replace(window.location.pathname);
    }
  }, [resetForm, router, searchParams]);

  const openCreateForm = useCallback(() => {
    resetForm();
    setFormOpen(true);
  }, [resetForm]);

  const openEditForm = useCallback(
    (product: Product) => {
      startEdit(product);
      setFormOpen(true);
    },
    [startEdit],
  );

  const openDuplicateForm = useCallback(
    (id: string) => {
      const product = products.find((p) => p._id === id);
      if (!product) return;
      startDuplicate(product);
      setFormOpen(true);
    },
    [products, startDuplicate],
  );

  // Open edit modal when linked from overview inventory (?edit=productId)
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || deepLinkHandled.current) return;

    deepLinkHandled.current = true;
    productsApi
      .getById(editId)
      .then((product) => {
        formState.startEdit(product);
        setFormOpen(true);
      })
      .catch(() => {
        deepLinkHandled.current = false;
      });
  }, [searchParams, formState]);

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
  const deleteProduct = useDeleteProduct();
  const bulkUpdate = useBulkUpdate();
  const bulkDelete = useBulkDelete();

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAllVisible() {
    const visibleIds = products.map((p) => p._id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedProductIds.includes(id));
    setSelectedProductIds((prev) =>
      allSelected ? prev.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...prev, ...visibleIds]))
    );
  }

  async function handleBulkApply(payload: {
    discount?: number;
    discountPrice?: number;
    status?: StatusKey;
    discountStartsAt?: string;
    discountEndsAt?: string;
  }) {
    await bulkUpdate.mutateAsync({ productIds: selectedProductIds, ...payload });
    setSelectedProductIds([]);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedProductIds);
    setSelectedProductIds([]);
  }

  const pendingDeleteProduct = confirmDeleteId ? products.find((p) => p._id === confirmDeleteId) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {stats.totalProducts > 0
              ? `${stats.totalProducts} product${stats.totalProducts === 1 ? "" : "s"} in catalog`
              : description}
          </p>
        </div>
        {permissions.canCreate && (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            Add product
          </button>
        )}
      </div>

      <div className={`space-y-4 ${selectedProductIds.length > 0 && permissions.canBulkUpdate ? "pb-24" : ""}`}>
        <ProductFiltersToolbar
          stats={stats}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          isFetching={isFetching}
          visibleCount={products.length}
          filteredTotal={total}
        />

        <ProductTable
          products={products}
          total={total}
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          isLoading={isLoading}
          isFetching={isFetching}
          categories={categories}
          subcategories={subcategories}
          selectedStatus={selectedStatus}
          selectedProductIds={selectedProductIds}
          hasActiveFilters={hasActiveFilters}
          canCreate={permissions.canCreate}
          onToggleProduct={toggleProduct}
          onToggleAllVisible={toggleAllVisible}
          onEdit={openEditForm}
          onDuplicate={openDuplicateForm}
          onDelete={setConfirmDeleteId}
          onAddProduct={openCreateForm}
          onClearFilters={handleClearFilters}
          canDelete={permissions.canDelete}
          canDuplicate={permissions.canCreate}
          onPageChange={setPage}
        />
      </div>

      {permissions.canBulkUpdate && (
        <BulkActionBar
          selectedCount={selectedProductIds.length}
          canBulkDelete={permissions.canBulkDelete}
          onClearSelection={() => setSelectedProductIds([])}
          onApplyUpdate={handleBulkApply}
          onBulkDelete={handleBulkDelete}
          loading={bulkUpdate.isPending || bulkDelete.isPending}
        />
      )}

      <ProductFormModal
        open={formOpen}
        onClose={closeFormAndReset}
        formState={formState}
        categories={categories}
        subcategories={subcategories}
      />

      <DeleteProductDialog
        product={pendingDeleteProduct}
        deleting={deleteProduct.isPending}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={(id) => {
          deleteProduct.mutate(id, { onSuccess: () => setConfirmDeleteId(null) });
        }}
      />
    </div>
  );
}
