// features/products/constants.ts
import type { StatusKey } from "./types";
import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB } from "@/lib/uploadConstraints";

export { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB };

export const MAX_IMAGES = 8;

export const DEFAULT_PAGE_SIZE = 25;

export const STATUS_META: Record<
  StatusKey,
  { label: string; badge: string; dot: string }
> = {
  active: {
    label: "Active",
    badge: "bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  inactive: {
    label: "Inactive",
    badge: "bg-slate-500/10 text-slate-400",
    dot: "bg-slate-400",
  },
  draft: {
    label: "Draft",
    badge: "bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
  },
};

const EMPTY_SEO_LOCALE = {
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  ogImage: "",
  canonicalUrl: "",
};

export const EMPTY_FORM = {
  name: { fr: "", en: "" },
  slug: { fr: "", en: "" },
  description: { fr: "", en: "" },
  price: "",
  quantity: "",
  category: "",
  subcategory: "",
  discount: "",
  discountPrice: "",
  status: "active" as StatusKey,
  discountStartsAt: "",
  discountEndsAt: "",
  seo: {
    fr: { ...EMPTY_SEO_LOCALE },
    en: { ...EMPTY_SEO_LOCALE },
  },
  structuredData: {
    gtin: "",
    mpn: "",
    brand: "",
    condition: "NewCondition" as const,
  },
  noIndex: false,
};

export const ROLE_PERMISSIONS = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canBulkUpdate: true,
    canBulkDelete: true,
  },
  manager: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canBulkUpdate: true,
    canBulkDelete: false,
  },
} as const;