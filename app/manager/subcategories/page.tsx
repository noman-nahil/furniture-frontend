import { SubcategoriesManagement } from "@/features/subcategories/SubcategoriesManagement";

export default function ManagerSubcategoriesPage() {
  return (
    <SubcategoriesManagement
      role="manager"
      title="Subcategories"
      description="Organize the catalog under each parent category."
    />
  );
}
