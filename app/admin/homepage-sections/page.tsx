import { HomepageSectionsManagement } from "@/features/homepage-sections/HomepageSectionsManagement";

export default function AdminHomepageSectionsPage() {
  return (
    <HomepageSectionsManagement
      role="admin"
      title="Homepage sections"
      description="Create, order and curate the sections that render on the storefront homepage."
    />
  );
}
