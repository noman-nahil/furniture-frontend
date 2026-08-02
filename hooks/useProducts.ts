// hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/productsApi";
import type { ProductFilters } from "@/features/products/types";

export function useProducts(
  page: number,
  pageSize: number,
  filters: ProductFilters,
) {
  return useQuery({
    queryKey: ["products", page, pageSize, filters],
    queryFn: () => productsApi.list(page, pageSize, filters),
    placeholderData: (prev) => prev, // keeps old page visible while new page loads
  });
}
