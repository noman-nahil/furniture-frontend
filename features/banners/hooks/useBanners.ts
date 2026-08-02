// features/banners/hooks/useBanners.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { bannersApi } from "../api/bannersApi";

export function useBannersQuery() {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => bannersApi.list(),
    staleTime: 30_000,
  });
}
