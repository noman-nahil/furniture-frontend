// features/subcategories/types.ts

export type SubcategoryStatusKey = "active" | "inactive";

export type SubcategoryStatusFilter = SubcategoryStatusKey | "ALL";

export type Category = { _id: string; name: string };

export type Subcategory = {
  _id: string;
  name: string;
  slug?: string; // server-generated, never edited directly
  parentCategoryId: string;
  /** Empty when the endpoint returned an un-populated parentCategory reference. */
  parentCategoryName: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
};

export type SubcategoryStatusCounts = {
  total: number;
  active: number;
  inactive: number;
};

export type SubcategoryListResponse = {
  data: Subcategory[];
  total: number;
  page: number;
  pageSize: number;
  statusCounts?: SubcategoryStatusCounts;
};

export type SubcategoryFilters = {
  search?: string;
  category?: string;
  status?: SubcategoryStatusFilter;
};

export type SubcategoryFormValues = {
  name: string;
  parentCategory: string;
  isActive: boolean;
};

export type BulkUpdatePayload = {
  subcategoryIds: string[];
  isActive?: boolean;
};

/**
 * The API has no bulk endpoints for subcategories, so bulk operations fan out
 * into one request per id and can succeed partially — hence the failure fields.
 */
export type BulkUpdateResult = {
  updated: number;
  failed: number;
  firstError?: string;
};

export type BulkDeleteResult = {
  deleted: number;
  failed: number;
  firstError?: string;
};

export type SubcategoriesManagementRole = "admin" | "manager";

export type StagedImage = {
  file: File;
  preview: string;
  error?: string;
};
