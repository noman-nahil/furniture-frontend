// features/categories/hooks/useCategories.ts

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/categoriesApi";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 30_000,
  });
}