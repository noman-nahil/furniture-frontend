// features/homepage-sections/hooks/useHomepageSections.ts
"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { homepageSectionsApi } from "../api/homepageSectionsApi";

export const HOMEPAGE_SECTIONS_QUERY_KEY = ["admin-homepage-sections"];

export function homepageSectionQueryKey(id: string) {
  return [...HOMEPAGE_SECTIONS_QUERY_KEY, id];
}

/**
 * The list and the open section carry overlapping data (product counts,
 * status), so a write invalidates both.
 */
export function invalidateHomepageSections(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: HOMEPAGE_SECTIONS_QUERY_KEY });
}

export function useHomepageSectionsQuery() {
  return useQuery({
    queryKey: HOMEPAGE_SECTIONS_QUERY_KEY,
    queryFn: () => homepageSectionsApi.list(),
    staleTime: 30_000,
  });
}

/**
 * Full section including populated products. The list endpoint only returns
 * IDs, so the editor loads this once a section is opened.
 */
export function useHomepageSectionQuery(id: string | null) {
  return useQuery({
    queryKey: homepageSectionQueryKey(id ?? ""),
    queryFn: () => homepageSectionsApi.getById(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
