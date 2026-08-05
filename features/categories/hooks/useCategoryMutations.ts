// features/categories/hooks/useCategoryMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoriesApi } from "../api/categoriesApi";
import type { CategoryReorderItem } from "../types";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function useReorderCategories() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (items: CategoryReorderItem[]) => categoriesApi.reorder(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      // Product / subcategory admin dropdowns share this cache key.
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: unknown) => toast.error(errorMessage(err, "Failed to reorder categories.")),
  });
}
