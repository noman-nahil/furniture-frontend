export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 animate-pulse">
      <div className="mb-10 space-y-3">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="h-10 w-72 max-w-full rounded bg-gray-200" />
        <div className="h-4 w-40 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-[#FAFAF8] overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
