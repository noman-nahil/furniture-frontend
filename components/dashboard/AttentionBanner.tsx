import Link from "next/link";

type AttentionBannerProps = {
  pendingCount: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export function AttentionBanner({
  pendingCount,
  lowStockCount,
  outOfStockCount,
}: AttentionBannerProps) {
  const hasPending = pendingCount > 0;
  const hasStockIssues = lowStockCount > 0 || outOfStockCount > 0;

  if (!hasPending && !hasStockIssues) {
    return null;
  }

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400"
            aria-hidden
          >
            <AlertIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-200">Needs attention</p>
            <ul className="mt-1 space-y-0.5 text-xs text-slate-300">
              {hasPending && (
                <li>
                  {pendingCount} pending order{pendingCount === 1 ? "" : "s"} awaiting confirmation
                </li>
              )}
              {hasStockIssues && (
                <li>
                  {lowStockCount > 0 && (
                    <span>
                      {lowStockCount} low stock
                      {outOfStockCount > 0 ? " · " : ""}
                    </span>
                  )}
                  {outOfStockCount > 0 && (
                    <span>
                      {outOfStockCount} out of stock
                    </span>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 pl-11 sm:pl-0">
          {hasPending && (
            <Link
              href="/admin/orders?status=PENDING"
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400/50"
            >
              View orders
            </Link>
          )}
          {hasStockIssues && (
            <Link
              href="/admin/products"
              className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            >
              Manage inventory
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
