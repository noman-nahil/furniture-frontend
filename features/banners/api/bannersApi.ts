// features/banners/api/bannersApi.ts
import { apiFetch } from "@/lib/authClient";
import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import type {
  Banner,
  BannerListResponse,
  BannerReorderItem,
  BannerStatusKey,
} from "../types";

async function parseErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return (data as { message?: string; error?: string }).message
    ?? (data as { message?: string; error?: string }).error
    ?? "Request failed.";
}

export const bannersApi = {
  list: () => apiFetch<BannerListResponse>("/banners/admin/all"),

  getById: (id: string) => apiFetch<Banner>(`/banners/${id}`),

  delete: (id: string) => apiFetch<void>(`/banners/${id}`, { method: "DELETE" }),

  updateStatus: (id: string, status: BannerStatusKey) =>
    apiFetch<Banner>(`/banners/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  reorder: (items: BannerReorderItem[]) =>
    apiFetch<{ matchedCount: number; modifiedCount: number }>("/banners/reorder", {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),

  create: async (formData: FormData): Promise<Banner> => {
    const baseUrl = getClientApiBaseUrl();
    const res = await authenticatedFetch(joinApiUrl(baseUrl, "/banners"), {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json() as Promise<Banner>;
  },

  update: async (id: string, formData: FormData): Promise<Banner> => {
    const baseUrl = getClientApiBaseUrl();
    const res = await authenticatedFetch(joinApiUrl(baseUrl, `/banners/${id}`), {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json() as Promise<Banner>;
  },
};
