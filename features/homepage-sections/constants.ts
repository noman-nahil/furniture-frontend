// features/homepage-sections/constants.ts
import type {
  HomepageSectionFormValues,
  HomepageSectionStatusKey,
} from "./types";

export const STATUS_META: Record<
  HomepageSectionStatusKey,
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
};

export const EMPTY_FORM: HomepageSectionFormValues = {
  title: "",
  slug: "",
  sectionType: "",
  status: "active",
  sortOrder: "",
  limit: "",
};

/** Mirrors config/homepageSections.js — kept in sync via the API's `limit` validation. */
export const MAX_SECTION_PRODUCTS = 100;
export const MAX_SECTION_LIMIT = 100;

/** Page size for the product picker's search results. */
export const PRODUCT_PICKER_PAGE_SIZE = 20;

/**
 * Mirrors middleware/homepageSectionPermissions.js.
 *
 * A manager may curate the products inside an existing section and nothing
 * else: PUT /homepage-sections/:id rejects any other field for their role, and
 * create/delete/status/reorder are admin-only. Hiding those controls keeps the
 * UI truthful rather than offering calls the API refuses.
 */
export const ROLE_PERMISSIONS = {
  admin: {
    canCreate: true,
    canEditDetails: true,
    canDelete: true,
    canToggleStatus: true,
    canReorderSections: true,
    canManageProducts: true,
  },
  manager: {
    canCreate: false,
    canEditDetails: false,
    canDelete: false,
    canToggleStatus: false,
    canReorderSections: false,
    canManageProducts: true,
  },
} as const;
