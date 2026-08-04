import Link from "next/link";

type SearchResultsHeaderProps = {
  search: string;
  total: number;
  isError?: boolean;
};

export function SearchResultsHeader({
  search,
  total,
  isError = false,
}: SearchResultsHeaderProps) {
  if (!search) {
    return (
      <div className="mb-8 lg:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          All Products
        </h1>
        <p className="mt-2 text-gray-600 text-base sm:text-lg">
          Browse our complete collection of premium furniture
        </p>
        {total > 0 && (
          <p className="mt-3 text-sm font-medium text-teal-800 tabular-nums">
            {total} product{total === 1 ? "" : "s"} available
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8 lg:mb-12">
      <p className="text-sm font-medium text-teal-800 mb-2">Search results</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
        {isError ? "Search unavailable" : (
          <>
            Results for{" "}
            <span className="text-teal-800">&ldquo;{search}&rdquo;</span>
          </>
        )}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {!isError && (
          <p className="text-sm text-gray-600 tabular-nums">
            {total === 0
              ? "No products found"
              : `${total} product${total === 1 ? "" : "s"} found`}
          </p>
        )}
        <Link
          href="/products"
          className="text-sm font-semibold text-teal-800 underline-offset-2 hover:underline"
        >
          Clear search
        </Link>
      </div>
    </div>
  );
}
