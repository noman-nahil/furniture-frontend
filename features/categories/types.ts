// features/categories/types.ts

export type Category = {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  image?: string;
  createdAt?: string;
};

export type CategoryFormValues = {
  name: string;
  slug: string;
  isActive: boolean;
};

export type CategoriesManagementRole = "admin" | "manager";