// features/banners/types.ts

export type BannerStatusKey = "active" | "inactive";

export type BannerStatusFilter = BannerStatusKey | "ALL";

export type Banner = {
  _id: string;
  title: string;
  /** R2 object key, a `/public` path, or an absolute URL. Resolve with getImageUrl(). */
  image: string;
  alt: string;
  sortOrder: number;
  status: BannerStatusKey;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerStatusCounts = {
  total: number;
  active: number;
  inactive: number;
};

export type BannerListResponse = {
  data: Banner[];
  total: number;
  statusCounts: BannerStatusCounts;
};

export type BannerFormValues = {
  title: string;
  alt: string;
  sortOrder: string;
  status: BannerStatusKey;
};

export type BannerReorderItem = {
  id: string;
  sortOrder: number;
};

export type BannerManagementRole = "admin" | "manager";
