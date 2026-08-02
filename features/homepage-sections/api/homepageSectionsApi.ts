// features/homepage-sections/api/homepageSectionsApi.ts
import { apiFetch } from "@/lib/authClient";
import type {
  HomepageSectionDetail,
  HomepageSectionListResponse,
  HomepageSectionReorderItem,
  HomepageSectionStatusKey,
  HomepageSectionTypeKey,
} from "../types";

export type HomepageSectionWritePayload = {
  title?: string;
  slug?: string;
  sectionType?: HomepageSectionTypeKey;
  status?: HomepageSectionStatusKey;
  sortOrder?: number;
  limit?: number;
  /** Product ObjectIds only, in curated order. */
  products?: string[];
};

export const homepageSectionsApi = {
  list: () =>
    apiFetch<HomepageSectionListResponse>("/homepage-sections/admin/all"),

  getById: (id: string) =>
    apiFetch<HomepageSectionDetail>(`/homepage-sections/${id}`),

  create: (payload: HomepageSectionWritePayload) =>
    apiFetch<HomepageSectionDetail>("/homepage-sections", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: HomepageSectionWritePayload) =>
    apiFetch<HomepageSectionDetail>(`/homepage-sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: string, status: HomepageSectionStatusKey) =>
    apiFetch<HomepageSectionDetail>(`/homepage-sections/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  reorder: (items: HomepageSectionReorderItem[]) =>
    apiFetch<{ matchedCount: number; modifiedCount: number }>(
      "/homepage-sections/reorder",
      {
        method: "PATCH",
        body: JSON.stringify({ items }),
      },
    ),

  delete: (id: string) =>
    apiFetch<void>(`/homepage-sections/${id}`, { method: "DELETE" }),
};
