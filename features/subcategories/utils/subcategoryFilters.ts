// features/subcategories/utils/subcategoryFilters.ts
import type {
  Category,
  Subcategory,
  SubcategoryFilters,
  SubcategoryListResponse,
  SubcategoryStatusCounts,
} from "../types";

export function categoryNameById(categories: Category[], id?: string): string {
  return categories.find((c) => c._id === id)?.name ?? id ?? "-";
}

/** Falls back to the categories list when the API returned an un-populated parent. */
export function parentCategoryLabel(subcategory: Subcategory, categories: Category[]): string {
  return subcategory.parentCategoryName || categoryNameById(categories, subcategory.parentCategoryId);
}

function matchesSearch(subcategory: Subcategory, query: string): boolean {
  if (!query) return true;
  return (
    subcategory.name.toLowerCase().includes(query) ||
    (subcategory.slug ?? "").toLowerCase().includes(query) ||
    subcategory.parentCategoryName.toLowerCase().includes(query) ||
    subcategory._id.toLowerCase().includes(query)
  );
}

export function countByStatus(subcategories: Subcategory[]): SubcategoryStatusCounts {
  const active = subcategories.reduce((sum, s) => sum + (s.isActive ? 1 : 0), 0);
  return { total: subcategories.length, active, inactive: subcategories.length - active };
}

/**
 * Client-side stand-in for the server-paginated product list. GET /subcategories
 * returns the full taxonomy in a single array, so search, parent filtering,
 * status counts and paging are derived here and handed back in the same shape
 * ProductsManagement receives from the API.
 *
 * Status counts deliberately ignore the status filter (they feed the status
 * tabs) but do respect search and parent category, matching the product list.
 */
export function selectSubcategoryPage(
  subcategories: Subcategory[],
  page: number,
  pageSize: number,
  filters: SubcategoryFilters = {},
): SubcategoryListResponse {
  const query = (filters.search ?? "").trim().toLowerCase();

  const scoped = subcategories.filter(
    (s) =>
      matchesSearch(s, query) &&
      (!filters.category || s.parentCategoryId === filters.category),
  );

  const statusCounts = countByStatus(scoped);

  const status = filters.status ?? "ALL";
  const matched =
    status === "ALL" ? scoped : scoped.filter((s) => (status === "active" ? s.isActive : !s.isActive));

  const sorted = [...matched].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    data: sorted.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    statusCounts,
  };
}
