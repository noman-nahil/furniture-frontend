// features/subcategories/api/subcategoriesApi.ts
import { apiFetch } from "@/lib/authClient";
import { getClientApiBaseUrl, joinApiUrl } from "@/lib/apiUrl";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import type {
  BulkDeleteResult,
  BulkUpdatePayload,
  BulkUpdateResult,
  Category,
  Subcategory,
  SubcategoryReorderItem,
} from "../types";

/** How many fan-out requests a bulk action keeps in flight at once. */
const BULK_CONCURRENCY = 5;

type RawSubcategory = {
  _id: string;
  name: string;
  slug?: string;
  parentCategory?: { _id?: string; id?: string; name?: string } | string | null;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
};

/**
 * The list endpoint populates parentCategory while create returns it as a raw
 * id, so both shapes are flattened here — the rest of the module only ever
 * sees parentCategoryId / parentCategoryName.
 */
function normalizeSubcategory(raw: RawSubcategory): Subcategory {
  const parent = raw.parentCategory;
  const isPopulated = parent != null && typeof parent === "object";

  const parentCategoryId = isPopulated
    ? String(parent._id ?? parent.id ?? "")
    : parent != null
      ? String(parent)
      : "";

  return {
    _id: raw._id,
    name: raw.name,
    slug: raw.slug,
    parentCategoryId,
    parentCategoryName: isPopulated ? (parent.name ?? "") : "",
    image: raw.image || undefined,
    isActive: raw.isActive !== false,
    sortOrder: raw.sortOrder ?? 0,
    createdAt: raw.createdAt,
  };
}

async function parseErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return (data as { message?: string; error?: string }).message
    ?? (data as { message?: string; error?: string }).error
    ?? "Request failed.";
}

async function sendMultipart(
  path: string,
  method: "POST" | "PUT",
  formData: FormData,
  signal?: AbortSignal,
): Promise<Subcategory> {
  const baseUrl = getClientApiBaseUrl();
  const res = await authenticatedFetch(joinApiUrl(baseUrl, path), {
    method,
    body: formData,
    signal,
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return normalizeSubcategory((await res.json()) as RawSubcategory);
}

async function runBulk<T>(items: T[], task: (item: T) => Promise<unknown>) {
  let succeeded = 0;
  let firstError: string | undefined;

  for (let i = 0; i < items.length; i += BULK_CONCURRENCY) {
    const results = await Promise.allSettled(items.slice(i, i + BULK_CONCURRENCY).map(task));
    for (const result of results) {
      if (result.status === "fulfilled") {
        succeeded += 1;
      } else if (!firstError) {
        firstError = result.reason instanceof Error ? result.reason.message : "Request failed.";
      }
    }
  }

  return { succeeded, failed: items.length - succeeded, firstError };
}

export const subcategoriesApi = {
  /**
   * Returns the whole taxonomy — the endpoint has no paging, search or status
   * counts, so those are derived client-side in utils/subcategoryFilters.
   */
  list: async (): Promise<Subcategory[]> => {
    const raw = await apiFetch<RawSubcategory[]>("/subcategories");
    return raw.map(normalizeSubcategory);
  },

  categories: () => apiFetch<Category[]>("/categories"),

  getById: async (id: string): Promise<Subcategory> =>
    normalizeSubcategory(await apiFetch<RawSubcategory>(`/subcategories/${id}`)),

  delete: (id: string) => apiFetch<{ success: boolean }>(`/subcategories/${id}`, { method: "DELETE" }),

  reorder: (items: SubcategoryReorderItem[]) =>
    apiFetch<{ matchedCount: number; modifiedCount: number }>("/subcategories/reorder", {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),

  create: (formData: FormData, signal?: AbortSignal) =>
    sendMultipart("/subcategories", "POST", formData, signal),

  update: (id: string, formData: FormData, signal?: AbortSignal) =>
    sendMultipart(`/subcategories/${id}`, "PUT", formData, signal),

  bulkUpdate: async ({ subcategoryIds, isActive }: BulkUpdatePayload): Promise<BulkUpdateResult> => {
    const { succeeded, failed, firstError } = await runBulk(subcategoryIds, (id) => {
      const fd = new FormData();
      if (isActive !== undefined) fd.append("isActive", String(isActive));
      return sendMultipart(`/subcategories/${id}`, "PUT", fd);
    });

    return { updated: succeeded, failed, firstError };
  },

  bulkDelete: async (subcategoryIds: string[]): Promise<BulkDeleteResult> => {
    const { succeeded, failed, firstError } = await runBulk(subcategoryIds, (id) =>
      subcategoriesApi.delete(id),
    );

    return { deleted: succeeded, failed, firstError };
  },
};
