// features/banners/BannerManagement.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { ROLE_PERMISSIONS } from "./constants";
import { useBannersQuery } from "./hooks/useBanners";
import { useBannerForm } from "./hooks/useBannerForm";
import {
  useDeleteBanner,
  useReorderBanners,
  useToggleBannerStatus,
} from "./hooks/useBannerMutations";
import { BannerTable } from "./components/BannerTable";
import { BannerForm } from "./components/BannerForm";
import { DeleteBannerDialog } from "./components/DeleteBannerDialog";
import type { Banner, BannerManagementRole } from "./types";

type BannerManagementProps = {
  title?: string;
  description?: string;
  /** Controls which destructive actions are available. Defaults to "admin". */
  role?: BannerManagementRole;
};

export function BannerManagement({
  title = "Banners",
  description = "Manage the storefront hero carousel. Active banners show in sort order.",
  role = "admin",
}: BannerManagementProps) {
  const permissions = ROLE_PERMISSIONS[role];
  const { data, isLoading } = useBannersQuery();
  const formState = useBannerForm();

  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteBanner = useDeleteBanner();
  const toggleStatus = useToggleBannerStatus();
  const reorderBanners = useReorderBanners();

  // Already sorted by the API (sortOrder, then createdAt) — the same order
  // the storefront carousel uses, so the table is a faithful preview.
  const banners = useMemo(() => data?.data ?? [], [data]);
  const statusCounts = data?.statusCounts;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return banners;
    return banners.filter(
      (b) =>
        b.title.toLowerCase().includes(normalizedQuery) ||
        b.alt.toLowerCase().includes(normalizedQuery) ||
        b._id.toLowerCase().includes(normalizedQuery)
    );
  }, [banners, normalizedQuery]);

  // Reordering is positional, so it only makes sense against the unfiltered
  // list — a search would otherwise make "move down" skip hidden rows.
  const canReorder = permissions.canReorder && !normalizedQuery;

  const handleMove = useCallback(
    (banner: Banner, direction: -1 | 1) => {
      const index = banners.findIndex((b) => b._id === banner._id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= banners.length) return;

      const next = [...banners];
      [next[index], next[target]] = [next[target], next[index]];

      // Send the whole list with compacted positions so sortOrder stays
      // gap-free no matter what the values were before.
      reorderBanners.mutate(
        next.map((b, sortOrder) => ({ id: b._id, sortOrder }))
      );
    },
    [banners, reorderBanners]
  );

  const handleToggleStatus = useCallback(
    (banner: Banner) => {
      toggleStatus.mutate({
        id: banner._id,
        status: banner.status === "active" ? "inactive" : "active",
      });
    },
    [toggleStatus]
  );

  const handleConfirmDelete = useCallback(
    (id: string) => {
      deleteBanner.mutate(id, {
        onSuccess: () => {
          if (formState.editingId === id) formState.resetForm();
          setConfirmDeleteId(null);
        },
        onError: () => setConfirmDeleteId(null),
      });
    },
    [deleteBanner, formState]
  );

  const pendingDelete =
    permissions.canDelete && confirmDeleteId
      ? banners.find((b) => b._id === confirmDeleteId) ?? null
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
          <p className="text-xs text-slate-400">
            {statusCounts && statusCounts.total > 0
              ? `${statusCounts.total} banner${statusCounts.total === 1 ? "" : "s"} · ${statusCounts.active} live on the storefront`
              : description}
          </p>
        </div>
        {permissions.canCreate && (
          <button
            type="button"
            onClick={formState.resetForm}
            className="shrink-0 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            New banner
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <BannerTable
          banners={filtered}
          loading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={formState.startEdit}
          onDelete={setConfirmDeleteId}
          onToggleStatus={handleToggleStatus}
          onMove={handleMove}
          canDelete={permissions.canDelete}
          canToggleStatus={permissions.canToggleStatus}
          canReorder={canReorder}
          reordering={reorderBanners.isPending}
          togglingId={toggleStatus.isPending ? toggleStatus.variables?.id ?? null : null}
        />
        <BannerForm formState={formState} />
      </div>

      <DeleteBannerDialog
        banner={pendingDelete}
        deleting={deleteBanner.isPending}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
