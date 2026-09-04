export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60"
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />
    </div>
  );
}
