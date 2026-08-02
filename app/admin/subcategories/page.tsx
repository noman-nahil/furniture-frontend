import { SubcategoriesManagement } from "@/features/subcategories/SubcategoriesManagement";

export default function AdminSubcategoriesPage() {
  return (
    <SubcategoriesManagement
      role="admin"
      title="Subcategories"
      description="Organize the catalog under each parent category."
    />
  );
}
