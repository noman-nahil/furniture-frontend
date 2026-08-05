// features/categories/constants.ts

import type { CategoryFormValues } from "./types";

export const EMPTY_FORM: CategoryFormValues = {
  name: "",
  slug: "",
  sortOrder: "",
  isActive: true,
};

/**
 * Managers cannot delete: DELETE /categories/:id is restricted to admin by
 * roleMiddleware("admin"), while POST/PUT accept ["admin", "manager"]. Hiding
 * the action keeps the UI truthful rather than offering a call the API rejects.
 */
export const ROLE_PERMISSIONS = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canReorder: true,
  },
  manager: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canReorder: true,
  },
} as const;
