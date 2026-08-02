// features/categories/constants.ts

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
  },
  manager: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
  },
} as const;
