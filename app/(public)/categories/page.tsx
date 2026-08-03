import type { Metadata } from "next";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import { CategoryCard } from "@/features/catalog/components/CategoryCard";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { APP_NAME } from "@/lib/config";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Shop by Category",
  description: `Browse our full range of categories — furniture and home décor at ${APP_NAME}.`,
  path: "/categories",
  keywords: ["furniture categories", "home décor", APP_NAME],
});

/** Shape of GET /subcategories/active (parentCategory populated). */
type ActiveSubcategory = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parentCategory?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
};

function EmptyCategoriesState() {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-10 sm:p-16 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </div>
      <p className="text-gray-600 text-lg font-medium mb-1">No categories available</p>
      <p className="text-gray-500 text-sm">Please check back soon.</p>
    </div>
  );
}

export default async function CategoriesPage() {
  const res = await serverFetch<ActiveSubcategory[]>("/subcategories/active", {
    revalidate: 60,
  });

  const subcategories = isServerFetchError(res)
    ? []
    : Array.isArray(res)
      ? res.filter(
          (sub): sub is ActiveSubcategory & { parentCategory: { _id: string; name: string; slug: string } } =>
            Boolean(sub?.slug && sub?.parentCategory?.slug)
        )
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16">
      <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
          <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#B8935A]" />
          <span className="text-xs sm:text-sm font-semibold text-[#B8935A] uppercase tracking-wider">
            Browse
          </span>
          <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#B8935A]" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
          Shop by category
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
          Find exactly what you&apos;re looking for, organized by room and style
        </p>
      </div>

      {subcategories.length === 0 ? (
        <EmptyCategoriesState />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {subcategories.map((sub, i) => (
            <CategoryCard
              key={sub._id}
              name={sub.name}
              image={sub.image}
              href={`/category/${sub.parentCategory.slug}/${sub.slug}`}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
