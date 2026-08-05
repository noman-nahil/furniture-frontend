// features/categories/api/categoriesApi.ts
import { apiFetch } from "@/lib/authClient";
import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import type { Category, CategoryReorderItem } from "../types";

async function parseErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return (data as { message?: string; error?: string }).message
    ?? (data as { message?: string; error?: string }).error
    ?? "Request failed.";
}

export const categoriesApi = {
  list: () => apiFetch<Category[]>("/categories"),
  getById: (id: string) => apiFetch<Category>(`/categories/${id}`),
  delete: (id: string) => apiFetch<void>(`/categories/${id}`, { method: "DELETE" }),

  reorder: (items: CategoryReorderItem[]) =>
    apiFetch<{ matchedCount: number; modifiedCount: number }>("/categories/reorder", {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),

  create: async (formData: FormData): Promise<Category> => {
    const baseUrl = getClientApiBaseUrl();
    const res = await authenticatedFetch(joinApiUrl(baseUrl, "/categories"), {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json() as Promise<Category>;
  },

  update: async (id: string, formData: FormData): Promise<Category> => {
    const baseUrl = getClientApiBaseUrl();
    const res = await authenticatedFetch(joinApiUrl(baseUrl, `/categories/${id}`), {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json() as Promise<Category>;
  },
};
