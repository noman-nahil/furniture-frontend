import { CategoriesManagement } from "@/features/categories/CategoriesManagement";

export default function AdminCategoriesPage() {
  return (
    <CategoriesManagement
      role="admin"
      title="Categories"
      description="Add, edit, or remove product categories. Slug is used in URLs."
    />
  );
}
