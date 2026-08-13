// features/products/types.ts

export type StatusKey = "active" | "inactive" | "draft";

export type LocalizedText = {
  fr: string;
  en?: string;
};

export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
};

export type StructuredData = {
  gtin?: string;
  mpn?: string;
  brand?: string;
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
};

export type Product = {
  _id: string;
  name: LocalizedText;
  slug?: { fr?: string; en?: string };
  description?: LocalizedText;
  price: number;
  quantity: number;
  category: string;
  subcategory?: string;
  images?: string[];
  createdAt?: string;
  discount?: number;
  discountPrice?: number;
  finalPrice?: number;
  status?: StatusKey;
  discountStartsAt?: string;
  discountEndsAt?: string;
  seo?: { fr?: SeoFields; en?: SeoFields };
  structuredData?: StructuredData;
  noIndex?: boolean;
};

export type Category = { _id: string; name: string };

export type Subcategory = {
  _id: string;
  name: string;
  parentCategoryId: string;
};

export type ProductStatusCounts = {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  discounted: number;
};

export type ProductListResponse = {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  statusCounts?: ProductStatusCounts;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  status?: StatusKey | "ALL" | "DISCOUNTED";
};

export type SeoFormValues = {
  metaTitle: string;
  metaDescription: string;
  keywords: string; // comma-separated in the UI, split to an array on submit
  ogImage: string;
  canonicalUrl: string;
};

export type ProductFormValues = {
  name: { fr: string; en: string };
  slug: { fr: string; en: string };
  description: { fr: string; en: string };
  price: string;
  quantity: string;
  category: string;
  subcategory: string;
  discount: string;
  discountPrice: string;
  status: StatusKey;
  discountStartsAt: string;
  discountEndsAt: string;
  seo: {
    fr: SeoFormValues;
    en: SeoFormValues;
  };
  structuredData: {
    gtin: string;
    mpn: string;
    brand: string;
    condition: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
  };
  noIndex: boolean;
};

export type ProductCreatePayload = Record<string, unknown>;

export type BulkUpdatePayload = {
  productIds: string[];
  discount?: number;
  discountPrice?: number;
  status?: StatusKey;
  discountStartsAt?: string;
  discountEndsAt?: string;
};

export type ProductsManagementRole = "admin" | "manager";

export type ImageFile = {
  file: File;
  preview: string;
  error?: string;
};