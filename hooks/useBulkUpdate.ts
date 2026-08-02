// hooks/useBulkUpdate.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/productsApi";

export function useBulkUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.bulkUpdate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
