// features/homepage-sections/hooks/useHomepageSectionMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  homepageSectionsApi,
  type HomepageSectionWritePayload,
} from "../api/homepageSectionsApi";
import { invalidateHomepageSections } from "./useHomepageSections";
import type {
  HomepageSectionReorderItem,
  HomepageSectionStatusKey,
} from "../types";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function useSaveHomepageSection() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | null;
      payload: HomepageSectionWritePayload;
    }) =>
      id
        ? homepageSectionsApi.update(id, payload)
        : homepageSectionsApi.create(payload),
    onSuccess: (_section, variables) => {
      invalidateHomepageSections(qc);
      toast.success(variables.id ? "Section updated." : "Section created.");
    },
    onError: (err: unknown) =>
      toast.error(errorMessage(err, "Failed to save section.")),
  });
}

/**
 * The only write a manager is allowed to make. Sends nothing but the ordered
 * product IDs so the request passes the backend's field-scope guard.
 */
export function useSaveSectionProducts() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, products }: { id: string; products: string[] }) =>
      homepageSectionsApi.update(id, { products }),
    onSuccess: () => {
      invalidateHomepageSections(qc);
      toast.success("Products saved.");
    },
    onError: (err: unknown) =>
      toast.error(errorMessage(err, "Failed to save products.")),
  });
}

export function useToggleHomepageSectionStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: HomepageSectionStatusKey;
    }) => homepageSectionsApi.updateStatus(id, status),
    onSuccess: (section) => {
      invalidateHomepageSections(qc);
      toast.success(
        section.status === "active" ? "Section enabled." : "Section disabled.",
      );
    },
    onError: (err: unknown) =>
      toast.error(errorMessage(err, "Failed to update status.")),
  });
}

export function useReorderHomepageSections() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (items: HomepageSectionReorderItem[]) =>
      homepageSectionsApi.reorder(items),
    onSuccess: () => invalidateHomepageSections(qc),
    onError: (err: unknown) =>
      toast.error(errorMessage(err, "Failed to reorder sections.")),
  });
}

export function useDeleteHomepageSection() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => homepageSectionsApi.delete(id),
    onSuccess: () => {
      invalidateHomepageSections(qc);
      toast.success("Section deleted.");
    },
    onError: (err: unknown) =>
      toast.error(errorMessage(err, "Failed to delete section.")),
  });
}
