import { cache } from "react";
import type { Metadata } from "next";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import { PaginatedProductGrid } from "@/components/products/PaginatedProductGrid";
import type { ListProduct } from "@/components/products/PaginatedProductGrid";
import { fetchSubcategoryTitles } from "@/lib/seo/catalog";

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
// Fallback: slug → readable title
// ─────────────────────────────────────────────

function slugToTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<SlugParams>;
}): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const titles = await getSubcategoryTitles(categorySlug, subcategorySlug);

  const title = titles
    ? `${titles.subcategory} · ${titles.category}`
    : slugToTitle(subcategorySlug);

  const description = titles
    ? `Browse ${titles.subcategory} in ${titles.category} at Meubles De Paris.`
    : "Browse furniture and décor at Meubles De Paris.";

  return {
    title,
    description,
    openGraph: { title, description },
  };
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

  const res = await serverFetch(`/products?${qs.toString()}`);
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

  // ✅ Fixed: page previously called slugToTitle() for display names,
  //    ignoring the real category/subcategory names already fetched in
  //    generateMetadata. Now shares the same cache() call — one DB
  //    round-trip, real names used in both metadata and the h1/breadcrumb.
  const titles = await getSubcategoryTitles(categorySlug, subcategorySlug);
  const catDisplay = titles?.category ?? slugToTitle(categorySlug);
  const subDisplay = titles?.subcategory ?? slugToTitle(subcategorySlug);

  const emptyState = (
    <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
      <p className="text-gray-600">
        {isError
          ? "Products are currently unavailable. Please try again later."
          : `No products found in ${subDisplay}.`}
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          {/* ✅ Real category name from DB, not slug-mangled fallback */}
          <p className="text-sm text-gray-500 mb-1">{catDisplay}</p>
          <h1 className="text-3xl font-bold text-gray-900">{subDisplay}</h1>
        </div>

        {/* ✅ Fixed: shows real total from API, not current page batch size */}
        {total > 0 && (
          <span className="text-sm text-gray-500">
            {total} item{total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* ✅ Removed local `type Product` — uses shared ListProduct from
          PaginatedProductGrid. Same type across all product listing pages. */}
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
  );
}