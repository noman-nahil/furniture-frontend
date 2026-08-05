// features/categories/types.ts

export type Category = {
  _id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive?: boolean;
  image?: string;
  createdAt?: string;
};

export type CategoryFormValues = {
  name: string;
  slug: string;
  sortOrder: string;
  isActive: boolean;
};

export type CategoryReorderItem = {
  id: string;
  sortOrder: number;
};

export type CategoriesManagementRole = "admin" | "manager";
