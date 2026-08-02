// features/subcategories/hooks/useBulkUpdate.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { subcategoriesApi } from "../api/subcategoriesApi";
import { invalidateSubcategories } from "./useSubcategories";
import type { BulkUpdatePayload } from "../types";

function noun(count: number): string {
  return count === 1 ? "subcategory" : "subcategories";
}

export function useBulkUpdate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkUpdatePayload) => subcategoriesApi.bulkUpdate(payload),
    onSuccess: (result) => {
      invalidateSubcategories(qc);
      if (result.updated > 0) {
        toast.success(`Updated ${result.updated} ${noun(result.updated)}.`);
      }
      // Fan-out bulk actions can fail per item — surface why rather than
      // silently reporting a smaller success count.
      if (result.failed > 0) {
        toast.error(result.firstError ?? `${result.failed} ${noun(result.failed)} could not be updated.`);
      }
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Bulk update failed.");
    },
  });
}

export function useBulkDelete() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (subcategoryIds: string[]) => subcategoriesApi.bulkDelete(subcategoryIds),
    onSuccess: (result) => {
      invalidateSubcategories(qc);
      if (result.deleted > 0) {
        toast.success(`Deleted ${result.deleted} ${noun(result.deleted)}.`);
      }
      if (result.failed > 0) {
        toast.error(result.firstError ?? `${result.failed} ${noun(result.failed)} could not be deleted.`);
      }
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed.");
    },
  });
}

export function useDeleteSubcategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subcategoriesApi.delete(id),
    onSuccess: () => {
      invalidateSubcategories(qc);
      toast.success("Subcategory deleted.");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete subcategory.");
    },
  });
}
