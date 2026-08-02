// features/banners/hooks/useBannerMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bannersApi } from "../api/bannersApi";
import type { BannerReorderItem, BannerStatusKey } from "../types";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function useDeleteBanner() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted.");
    },
    onError: (err: unknown) => toast.error(errorMessage(err, "Failed to delete banner.")),
  });
}

export function useToggleBannerStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BannerStatusKey }) =>
      bannersApi.updateStatus(id, status),
    onSuccess: (banner) => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success(banner.status === "active" ? "Banner enabled." : "Banner disabled.");
    },
    onError: (err: unknown) => toast.error(errorMessage(err, "Failed to update status.")),
  });
}

export function useReorderBanners() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (items: BannerReorderItem[]) => bannersApi.reorder(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
    },
    onError: (err: unknown) => toast.error(errorMessage(err, "Failed to reorder banners.")),
  });
}
