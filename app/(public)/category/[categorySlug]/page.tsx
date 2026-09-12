import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import { PaginatedProductGrid } from "@/components/products/PaginatedProductGrid";
import type { ListProduct } from "@/components/products/PaginatedProductGrid";
import { lookupActiveCategory } from "@/lib/seo/catalog";
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

type PageParams = { params: Promise<{ categorySlug: string }> };

type CategoryPageSearchParams = {
  params: Promise<{ categorySlug: string }>;
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
// Shared fetch — deduplicates the category name lookup
// that runs in both generateMetadata and the page.
// ─────────────────────────────────────────────

const getCategory = cache(async (slug: string) => {
  return lookupActiveCategory(slug);
});

// ─────────────────────────────────────────────
// Slug → display name (used in both metadata and h1)
// ─────────────────────────────────────────────

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { categorySlug } = await params;

  const lookup = await getCategory(categorySlug);
  if (lookup.state === "missing") notFound();

  const title =
    lookup.state === "found" ? lookup.value.name : slugToTitle(categorySlug);
  const description = `Découvrez les ${title} — mobilier et décoration chez ${APP_NAME}.`;

  return buildPageMetadata({
    title,
    description,
    path: `/category/${categorySlug}`,
    image: lookup.state === "found" ? lookup.value.image : undefined,
    imageAlt: title,
    keywords: [title, "meubles", "décoration", APP_NAME],
  });
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const DEFAULT_LIMIT = 12;

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageSearchParams) {
  const { categorySlug } = await params;
  const sp = await searchParams;

  // ✅ Page number lives in the URL — shareable, bookmarkable,
  //    works with browser back/forward. Same pattern as ProductsPage.
  const page = Math.max(
    1,
    parseInt(typeof sp.page === "string" ? sp.page : "1") || 1
  );

  // ✅ server-side pagination — fetch only the current page's products.
  //    Previously fetched all products and paginated in client JS,
  //    sending the full payload to the browser on every request.
  const qs = new URLSearchParams({
    categorySlug,
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

  const lookup = await getCategory(categorySlug);
  if (lookup.state === "missing") notFound();

  const displayName =
    lookup.state === "found" ? lookup.value.name : slugToTitle(categorySlug);

  const emptyState = (
    <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
      <p className="text-gray-600">
        {isError
          ? "Products are currently unavailable. Please try again later."
          : "No products found in this category."}
      </p>
    </div>
  );

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: displayName, path: `/category/${categorySlug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>

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