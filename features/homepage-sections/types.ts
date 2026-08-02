// features/homepage-sections/types.ts
import type { FeaturedProduct } from "@/components/product/FeaturedProducts";

export type HomepageSectionStatusKey = "active" | "inactive";

export type HomepageSectionMode = "manual" | "automatic";

/**
 * Section types are declared by the backend registry
 * (config/homepageSections.js) and sent with the admin list, so the dashboard
 * never keeps its own copy. Typed as a string for that reason — new types
 * appear without a frontend release.
 */
export type HomepageSectionTypeKey = string;

export type HomepageSectionTypeOption = {
  key: HomepageSectionTypeKey;
  label: string;
  defaultTitle: string;
  description: string;
  supportedModes: HomepageSectionMode[];
};

/**
 * A product as it appears inside a section. The API populates these live from
 * the Products collection on every read — a section itself stores nothing but
 * the ObjectIds.
 */
export type SectionProduct = FeaturedProduct & {
  status?: string;
};

/** Row shape from GET /homepage-sections/admin/all — products are ID strings. */
export type HomepageSectionSummary = {
  _id: string;
  title: string;
  slug: string;
  sectionType: HomepageSectionTypeKey;
  mode: HomepageSectionMode;
  status: HomepageSectionStatusKey;
  sortOrder: number;
  limit: number;
  products: string[];
  productCount: number;
  createdAt?: string;
  updatedAt?: string;
};

/** Shape from GET /homepage-sections/:id — products are populated documents. */
export type HomepageSectionDetail = Omit<HomepageSectionSummary, "products" | "productCount"> & {
  products: SectionProduct[];
};

export type HomepageSectionStatusCounts = {
  total: number;
  active: number;
  inactive: number;
};

export type HomepageSectionListResponse = {
  data: HomepageSectionSummary[];
  total: number;
  statusCounts: HomepageSectionStatusCounts;
  sectionTypes: HomepageSectionTypeOption[];
};

export type HomepageSectionFormValues = {
  title: string;
  slug: string;
  sectionType: HomepageSectionTypeKey;
  status: HomepageSectionStatusKey;
  sortOrder: string;
  limit: string;
};

export type HomepageSectionReorderItem = {
  id: string;
  sortOrder: number;
};

export type HomepageSectionManagementRole = "admin" | "manager";

/** Storefront payload from GET /homepage-sections. */
export type PublicHomepageSection = {
  _id: string;
  title: string;
  slug: string;
  sectionType: HomepageSectionTypeKey;
  mode: HomepageSectionMode;
  status: HomepageSectionStatusKey;
  sortOrder: number;
  limit: number;
  products: FeaturedProduct[];
};
