import { Suspense } from "react";
import { ProductsManagement } from "@/features/products/ProductsManagement";

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsManagement
        role="manager"
        title="Products"
        description="Manage products, pricing and stock."
      />
    </Suspense>
  );
}
