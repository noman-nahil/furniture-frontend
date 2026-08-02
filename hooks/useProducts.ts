// hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../app/features/api/productsApi";

export function useProducts(page: number, pageSize: number, filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", page, pageSize, filters],
    queryFn: () => productsApi.list({ page, pageSize, ...filters }),
    placeholderData: (prev) => prev, // keeps old page visible while new page loads
  });
}