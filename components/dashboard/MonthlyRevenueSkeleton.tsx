/**
 * Loading placeholder for the monthly revenue chart card.
 */
export function MonthlyRevenueSkeleton() {
  return (
    <div className="min-h-80 rounded-xl border border-slate-800 bg-slate-900/60 p-6 lg:min-h-96">
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-44 animate-pulse rounded bg-slate-800" />
          <div className="h-8 w-32 animate-pulse rounded bg-slate-800/80" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-800" />
      </div>

      <div className="relative h-64 overflow-hidden rounded-lg bg-slate-950/40 lg:h-80">
        <svg
          className="absolute inset-x-0 bottom-0 h-full w-full text-slate-800"
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,90 Q50,70 100,75 T200,50 T300,60 T400,30 L400,120 L0,120 Z"
            fill="currentColor"
            className="animate-pulse opacity-60"
          />
        </svg>
      </div>
    </div>
  );
}

export default MonthlyRevenueSkeleton;
