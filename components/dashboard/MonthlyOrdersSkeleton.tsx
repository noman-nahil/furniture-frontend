/**
 * MonthlyOrdersSkeleton - loading placeholder for the monthly orders card.
 * Mirrors the real card's shell (border, padding, radius, min-height) so
 * swapping skeleton → real content via Suspense doesn't cause a layout
 * or color jump.
 */
export function MonthlyOrdersSkeleton() {
  return (
    <div className="min-h-80 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-800/70" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-800" />
      </div>

      <div className="flex h-64 items-end gap-3 px-2 sm:h-72">
        {[40, 65, 50, 80, 55, 90, 60, 75, 45, 85, 55, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t-md bg-slate-800"
            style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default MonthlyOrdersSkeleton;