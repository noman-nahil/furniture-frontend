// features/products/hooks/useBulkUpdate.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productsApi } from "../api/productsApi";
import type { BulkUpdatePayload } from "../types";

export function useBulkUpdate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkUpdatePayload) => productsApi.bulkUpdate(payload),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Updated ${result.updated} product${result.updated === 1 ? "" : "s"}.`);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Bulk update failed.");
    },
  });
}

export function useBulkDelete() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) => productsApi.bulkDelete(productIds),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Deleted ${result.deleted} product${result.deleted === 1 ? "" : "s"}.`);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed.");
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    },
  });
}