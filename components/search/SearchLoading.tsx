export function SearchLoading() {
  return (
    <div className="px-2 py-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-2 py-2.5 animate-pulse"
        >
          <div className="h-11 w-11 shrink-0 rounded-lg bg-gray-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-gray-100" />
            <div className="h-3 w-1/3 rounded bg-gray-100" />
          </div>
        </div>
      ))}
      <p className="sr-only">Loading suggestions</p>
    </div>
  );
}
