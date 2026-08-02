import { BannerManagement } from "@/features/banners/BannerManagement";

export default function AdminBannersPage() {
  return (
    <BannerManagement
      role="admin"
      title="Banners"
      description="Add, edit, reorder or remove storefront hero banners."
    />
  );
}
