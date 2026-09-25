import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import { PaginatedProductGrid } from "@/components/products/PaginatedProductGrid";
import type { ListProduct } from "@/components/products/PaginatedProductGrid";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import {
  fetchCategoryBySlug,
  fetchSubcategoryTitles,
} from "@/lib/seo/catalog";
import {
  breadcrumbJsonLd,
  JsonLd,
} from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { APP_NAME } from "@/lib/config";

// ─────────────────────────────────────────────
// ISR
// ─────────────────────────────────────────────

export const revalidate = 60;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type SlugParams = { categorySlug: string; subcategorySlug: string };

type PageProps = {
  params: Promise<SlugParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type ProductsApiResponse = {
  data: ListProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ─────────────────────────────────────────────
// Shared fetch — deduplicates fetchSubcategoryTitles
// across generateMetadata and the page body.
// Previously: metadata fetched titles, page ignored them
// and fell back to slug-mangling for display names.
// ─────────────────────────────────────────────

const getSubcategoryTitles = cache(
  async (categorySlug: string, subcategorySlug: string) => {
    return fetchSubcategoryTitles(categorySlug, subcategorySlug);
  }
);

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<SlugParams>;
}): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const [titles, category] = await Promise.all([
    getSubcategoryTitles(categorySlug, subcategorySlug),
    fetchCategoryBySlug(categorySlug),
  ]);

  if (titles.state === "unavailable") {
    throw new Error("Category catalog is unavailable");
  }
  if (titles.state === "missing") notFound();

  const { subcategory, category: categoryName } = titles.value;
  const title = `${subcategory} · ${categoryName}`;
  const description = `Parcourez les ${subcategory} de la catégorie ${categoryName} chez ${APP_NAME}.`;

  return buildPageMetadata({
    title,
    description,
    path: `/category/${categorySlug}/${subcategorySlug}`,
    image: category?.image,
    imageAlt: title,
    keywords: [subcategory, categoryName, "meubles", APP_NAME],
  });
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const DEFAULT_LIMIT = 12;

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const sp = await searchParams;

  const page = Math.max(
    1,
    parseInt(typeof sp.page === "string" ? sp.page : "1") || 1
  );

  // ✅ Server-side pagination — only fetches the current page's products.
  //    Previously fetched everything and paginated in client JS.
  const qs = new URLSearchParams({
    categorySlug,
    subcategorySlug,
    page: String(page),
    limit: String(DEFAULT_LIMIT),
  });

  const res = await serverFetch(`/products?${qs.toString()}`, {
    revalidate: 60,
  });
  const isError = isServerFetchError(res);

  let products: ListProduct[] = [];
  let total = 0;
  let totalPages = 1;

  if (!isError && res && typeof res === "object" && !Array.isArray(res)) {
    const payload = res as ProductsApiResponse;
    products = payload.data ?? [];
    total = payload.total ?? 0;
    totalPages = payload.totalPages ?? 1;
  }

  // Same cache() call as generateMetadata, so both use one taxonomy lookup.
  // Display names come from that confirmed result, for the h1 and breadcrumbs.
  const titles = await getSubcategoryTitles(categorySlug, subcategorySlug);
  if (titles.state === "unavailable") {
    throw new Error("Category catalog is unavailable");
  }
  if (titles.state === "missing") notFound();

  const catDisplay = titles.value.category;
  const subDisplay = titles.value.subcategory;

  const emptyState = (
    <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
      <p className="text-gray-600">
        {isError
          ? "Products are currently unavailable. Please try again later."
          : `No products found in ${subDisplay}.`}
      </p>
    </div>
  );

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: catDisplay, path: `/category/${categorySlug}` },
    {
      name: subDisplay,
      path: `/category/${categorySlug}/${subcategorySlug}`,
    },
  ];

  const breadcrumbLd = breadcrumbJsonLd(crumbs);

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <PageBreadcrumbs items={crumbs} />
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1">{catDisplay}</p>
            <h1 className="text-3xl font-bold text-gray-900">{subDisplay}</h1>
          </div>

          {total > 0 && (
            <span className="text-sm text-gray-500">
              {total} item{total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <PaginatedProductGrid
          products={products}
          total={total}
          page={page}
          totalPages={totalPages}
          limit={DEFAULT_LIMIT}
          search=""
          emptyState={emptyState}
        />
      </div>
    </>
  );
}