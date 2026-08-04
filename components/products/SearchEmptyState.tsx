import Link from "next/link";

type SearchEmptyStateProps = {
  search: string;
  variant: "empty" | "error";
};

export function SearchEmptyState({ search, variant }: SearchEmptyStateProps) {
  if (variant === "error") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/40 px-6 py-14 text-center sm:px-10">
        <p className="text-lg font-semibold text-gray-900">
          We couldn&apos;t load search results
        </p>
        <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
          The catalog service may be temporarily unavailable. Please try again
          in a moment.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={search ? `/products?search=${encodeURIComponent(search)}` : "/products"}
            className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
          >
            Retry
          </Link>
          <Link
            href="/categories"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Browse categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FAFAF8] px-6 py-14 text-center sm:px-10">
      <p className="text-lg font-semibold text-gray-900">
        No products for &ldquo;{search}&rdquo;
      </p>
      <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
        Try a broader term, check spelling, or browse by category to find the
        right piece.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
        >
          View all products
        </Link>
        <Link
          href="/categories"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Browse categories
        </Link>
      </div>
    </div>
  );
}
