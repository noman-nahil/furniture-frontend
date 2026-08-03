import type { Metadata } from "next";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import { PaginatedProductGrid } from "@/components/products/PaginatedProductGrid";
import type { ListProduct } from "@/components/products/PaginatedProductGrid";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { APP_NAME } from "@/lib/config";

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

// ✅ Cap search query length before sending to backend.
//    A 10,000-character search string is either a bug or an attack.
//    Truncating here prevents oversized query strings reaching the backend
//    regex engine (ReDoS risk) and keeps ISR cache key URLs sane.
const MAX_SEARCH_LENGTH = 200;

function parseSearchParam(raw: string | string[] | undefined): string {
  const str = typeof raw === "string" ? raw : "";
  return str.trim().slice(0, MAX_SEARCH_LENGTH);
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
  const page   = parsePageParam(params.page);

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("page",  String(page));
  qs.set("limit", String(DEFAULT_LIMIT));

  // ✅ Added revalidate: 60 to match page-level ISR.
  //    Without this, serverFetch uses cache: "no-store" and hits the
  //    backend fresh on every revalidation cycle. The page-level
  //    `export const revalidate = 60` does not automatically cache
  //    the underlying fetch — you must opt in per-fetch.
  const res = await serverFetch(
    `/products?${qs.toString()}`,
    { revalidate: 60 },
  );

  const isError = isServerFetchError(res);

  let products: ListProduct[] = [];
  let total      = 0;
  let totalPages = 1;

  if (!isError && res && typeof res === "object" && !Array.isArray(res)) {
    const payload = res as ProductsApiResponse;
    products   = payload.data       ?? [];
    total      = payload.total      ?? 0;
    totalPages = payload.totalPages ?? 1;
  }

  const emptyState = (
    <div className="rounded-xl border border-dashed border-gray-200 p-12 sm:p-16 text-center">
      <svg
        className="w-16 h-16 mx-auto text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <p className="text-gray-600 text-lg font-medium mb-2">
        {isError
          ? "Products are currently unavailable. Please try again later."
          : "No products found"}
      </p>
      <p className="text-gray-500 text-sm">
        {isError
          ? "The server may be temporarily down."
          : search
          ? `No results for "${search}". Try a different search term.`
          : "Check back soon for new arrivals!"}
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="mb-8 lg:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              {search ? `Search: "${search}"` : "All Products"}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              {search
                ? `Search results for "${search}"`
                : "Browse our complete collection of premium products"}
            </p>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-sm font-medium text-blue-600">
                {total} product{total === 1 ? "" : "s"}{" "}
                {search ? "found" : "available"}
              </span>
            </div>
          )}
        </div>
      </div>

      <PaginatedProductGrid
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        limit={DEFAULT_LIMIT}
        search={search}
        emptyState={emptyState}
      />
    </div>
  );
}