import type { Metadata } from "next";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import { PaginatedProductGrid } from "@/components/products/PaginatedProductGrid";
import type { ListProduct } from "@/components/products/PaginatedProductGrid";
import { SearchResultsHeader } from "@/components/products/SearchResultsHeader";
import { SearchEmptyState } from "@/components/products/SearchEmptyState";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { APP_NAME } from "@/lib/config";
import { normalizeSearch } from "@/lib/search/normalize";

export const revalidate = 60;

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type ProductsApiResponse = {
  data: ListProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const DEFAULT_LIMIT = 12;

function parseSearchParam(raw: string | string[] | undefined): string {
  return normalizeSearch(typeof raw === "string" ? raw : "");
}

function parsePageParam(raw: string | string[] | undefined): number {
  return Math.max(1, parseInt(typeof raw === "string" ? raw : "1") || 1);
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = parseSearchParam(params.search);

  if (search) {
    return buildPageMetadata({
      title: `Search: ${search}`,
      description: `Search results for "${search}" in our furniture and home décor catalog.`,
      path: "/products",
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: "All Products",
    description: `Browse our full catalog of furniture and home décor at ${APP_NAME}.`,
    path: "/products",
    keywords: ["furniture catalog", "home décor", APP_NAME],
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = parseSearchParam(params.search);
  const page = parsePageParam(params.page);

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("page", String(page));
  qs.set("limit", String(DEFAULT_LIMIT));

  // Catalog browse can use ISR. Search must stay fresh.
  const res = await serverFetch(
    `/products?${qs.toString()}`,
    search ? undefined : { revalidate: 60 },
  );

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

  const emptyState = search ? (
    <SearchEmptyState
      search={search}
      variant={isError ? "error" : "empty"}
    />
  ) : (
    <SearchEmptyState search="" variant={isError ? "error" : "empty"} />
  );

  // Non-search empty catalog copy
  const browseEmpty = isError ? (
    <SearchEmptyState search="" variant="error" />
  ) : (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FAFAF8] px-6 py-14 text-center">
      <p className="text-lg font-semibold text-gray-900">No products found</p>
      <p className="mt-2 text-sm text-gray-600">
        Check back soon for new arrivals.
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <SearchResultsHeader
        search={search}
        total={total}
        isError={isError}
      />

      <PaginatedProductGrid
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        limit={DEFAULT_LIMIT}
        search={search}
        emptyState={search ? emptyState : browseEmpty}
      />
    </div>
  );
}
