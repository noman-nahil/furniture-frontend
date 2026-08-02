// features/products/api/productsApi.ts
import { apiFetch } from "@/lib/authClient";
import { joinApiUrl, getClientApiBaseUrl } from "@/lib/apiUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import type {
  Product,
  Category,
  Subcategory,
  ProductListResponse,
  ProductFilters,
  BulkUpdatePayload,
} from "../types";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "ALL") {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

type RawSubcategory = {
  _id: string;
  name: string;
  parentCategory?: { _id?: string; id?: string } | string | null;
};

function normalizeSubcategory(raw: RawSubcategory): Subcategory {
  const parent = raw.parentCategory;
  const parentCategoryId =
    parent && typeof parent === "object"
      ? String(parent._id ?? parent.id ?? "")
      : parent != null
        ? String(parent)
        : "";

  return { _id: raw._id, name: raw.name, parentCategoryId };
}

async function parseErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return (data as { message?: string; error?: string }).message
    ?? (data as { message?: string; error?: string }).error
    ?? "Request failed.";
}

export const productsApi = {
  list: (page: number, pageSize: number, filters: ProductFilters = {}) =>
    apiFetch<ProductListResponse>(
      `/products/admin/all${buildQuery({
        page,
        limit: pageSize,
        search: filters.search,
        category: filters.category,
        status: filters.status,
      })}`
    ),

  categories: () => apiFetch<Category[]>("/categories"),

  subcategories: async (): Promise<Subcategory[]> => {
    const raw = await apiFetch<RawSubcategory[]>("/subcategories");
    return raw.map(normalizeSubcategory);
  },

  getById: (id: string) => apiFetch<Product>(`/products/${id}`),

  delete: (id: string) => apiFetch<void>(`/products/${id}`, { method: "DELETE" }),

  bulkUpdate: (payload: BulkUpdatePayload) =>
    apiFetch<{ updated: number }>("/products/bulk-update", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  bulkDelete: (productIds: string[]) =>
    apiFetch<{ deleted: number }>("/products/bulk-delete", {
      method: "DELETE",
      body: JSON.stringify({ productIds }),
    }),

  create: async (formData: FormData, signal?: AbortSignal): Promise<Product> => {
    const baseUrl = getClientApiBaseUrl();
    const res = await authenticatedFetch(joinApiUrl(baseUrl, "/products"), {
      method: "POST",
      body: formData,
      signal,
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json() as Promise<Product>;
  },

  update: async (id: string, formData: FormData, signal?: AbortSignal): Promise<Product> => {
    const baseUrl = getClientApiBaseUrl();
    const res = await authenticatedFetch(joinApiUrl(baseUrl, `/products/${id}`), {
      method: "PUT",
      body: formData,
      signal,
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    return res.json() as Promise<Product>;
  },
};