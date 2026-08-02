// features/products/hooks/useProducts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/productsApi";
import type { ProductFilters } from "../types";

/**
 * Server-paginated product list. Requires @tanstack/react-query and a
 * <QueryClientProvider> mounted above this in the tree (e.g. in app/layout.tsx
 * or a dedicated providers.tsx). If you don't want the dependency, see the
 * fallback note at the bottom of this file.
 */
export function useProductsQuery(page: number, pageSize: number, filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", page, pageSize, filters],
    queryFn: () => productsApi.list(page, pageSize, filters),
    staleTime: 30_000,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => productsApi.categories(),
    staleTime: 5 * 60_000, // categories change rarely — cache longer
  });
}

export function useSubcategoriesQuery() {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: () => productsApi.subcategories(),
    staleTime: 5 * 60_000,
  });
}
/*
 * NO-REACT-QUERY FALLBACK
 * If you'd rather not add @tanstack/react-query yet, replace the three hooks
 * above with a single manual hook like this (no caching/retry/dedup, but
 * zero new dependencies):
 *
 * export function useProductsManual(page: number, pageSize: number, filters: ProductFilters) {
 *   const [data, setData] = useState<ProductListResponse | null>(null);
 *   const [isLoading, setIsLoading] = useState(true);
 *   const [error, setError] = useState<string | null>(null);
 *
 *   useEffect(() => {
 *     const controller = new AbortController();
 *     setIsLoading(true);
 *     productsApi.list(page, pageSize, filters)
 *       .then(setData)
 *       .catch((err) => { if (!controller.signal.aborted) setError(err.message); })
 *       .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
 *     return () => controller.abort();
 *   }, [page, pageSize, filters.search, filters.category, filters.status]);
 *
 *   return { data, isLoading, error };
 * }
 */
