import { CategoriesManagement } from "@/features/categories/CategoriesManagement";

export default function ManagerCategoriesPage() {
  return (
    <CategoriesManagement
      role="manager"
      title="Categories"
      description="Add and edit product categories. Slug is used in URLs."
    />
  );
}
