// features/banners/constants.ts
import type { BannerFormValues, BannerStatusKey } from "./types";
import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB } from "@/lib/uploadConstraints";

export { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB };

export const STATUS_META: Record<
  BannerStatusKey,
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

export const EMPTY_FORM: BannerFormValues = {
  title: "",
  alt: "",
  sortOrder: "",
  status: "active",
};

/**
 * Managers cannot delete: DELETE /banners/:id is restricted to admin by
 * roleMiddleware("admin"), while POST/PUT/PATCH accept ["admin", "manager"].
 * Hiding the action keeps the UI truthful rather than offering a call the
 * API rejects.
 */
export const ROLE_PERMISSIONS = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canToggleStatus: true,
    canReorder: true,
  },
  manager: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canToggleStatus: true,
    canReorder: true,
  },
} as const;
