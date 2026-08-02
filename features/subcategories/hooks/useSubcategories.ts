// features/subcategories/hooks/useSubcategories.ts
"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { subcategoriesApi } from "../api/subcategoriesApi";

export const SUBCATEGORIES_QUERY_KEY = ["admin-subcategories"];

/**
 * features/products keeps its own normalized subcategory cache for the product
 * form's dropdown. Every mutation here invalidates it too so the two views
 * can't drift, without reaching into the products module.
 */
const PRODUCT_SUBCATEGORIES_QUERY_KEY = ["subcategories"];

export function invalidateSubcategories(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: SUBCATEGORIES_QUERY_KEY });
  qc.invalidateQueries({ queryKey: PRODUCT_SUBCATEGORIES_QUERY_KEY });
}

export function useSubcategoriesQuery() {
  return useQuery({
    queryKey: SUBCATEGORIES_QUERY_KEY,
    queryFn: () => subcategoriesApi.list(),
    staleTime: 30_000,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => subcategoriesApi.categories(),
    staleTime: 5 * 60_000, // categories change rarely — cache longer
  });
}
