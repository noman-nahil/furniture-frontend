// features/subcategories/constants.ts
import type { SubcategoryFormValues, SubcategoryStatusKey } from "./types";
import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB } from "@/lib/uploadConstraints";

export { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB };

export const DEFAULT_PAGE_SIZE = 25;

export const STATUS_META: Record<
  SubcategoryStatusKey,
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

export const EMPTY_FORM: SubcategoryFormValues = {
  name: "",
  parentCategory: "",
  isActive: true,
};

/**
 * Managers cannot delete: DELETE /subcategories/:id is restricted to admin by
 * roleMiddleware("admin"), so hiding it here keeps the UI truthful rather than
 * offering an action the API will reject.
 */
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
