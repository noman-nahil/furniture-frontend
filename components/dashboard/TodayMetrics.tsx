import Link from "next/link";
import { CURRENCY_CODE, LOCALE } from "@/lib/config";

export type PeriodSnapshot = {
  orders: number;
  revenue: number;
  deliveredRevenue: number;
  deliveredOrders: number;
};

export type PeriodMetrics = {
  today: PeriodSnapshot;
  yesterday: PeriodSnapshot;
};

type TodayMetricsProps = {
  metrics: PeriodMetrics;
};

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

function trendPct(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function TrendBadge({
  current,
  previous,
  label,
}: {
  current: number;
  previous: number;
  label: string;
}) {
  const pct = trendPct(current, previous);

  if (pct === null) {
    return (
      <span className="text-[11px] text-slate-500" aria-label={`${label}: no prior day data`}>
        vs yesterday
      </span>
    );
  }

  const positive = pct >= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium tabular-nums ${
        positive ? "text-emerald-400" : "text-red-400"
      }`}
      aria-label={`${label}: ${positive ? "up" : "down"} ${Math.abs(pct)} percent vs yesterday`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        className={positive ? "" : "rotate-180"}
        aria-hidden
      >
        <path
          d="M6 10V2M2.5 5.5 6 2l3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {positive ? "+" : ""}
      {pct}% vs yesterday
    </span>
  );
}

export function TodayMetrics({ metrics }: TodayMetricsProps) {
  const { today, yesterday } = metrics;

  return (
    <section
      aria-label="Today's performance"
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Today</h2>
          <p className="text-xs text-slate-500">Live snapshot for the current day</p>
        </div>
        <Link
          href="/admin/orders?date=TODAY"
          className="text-xs font-medium text-sky-400 transition-colors hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          View today&apos;s orders
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Orders"
          value={today.orders.toLocaleString()}
          trend={
            <TrendBadge
              current={today.orders}
              previous={yesterday.orders}
              label="Orders"
            />
          }
        />
        <MetricTile
          label="Sales"
          value={currencyFormatter.format(today.revenue)}
          trend={
            <TrendBadge
              current={today.revenue}
              previous={yesterday.revenue}
              label="Sales"
            />
          }
        />
        <MetricTile
          label="Delivered revenue"
          value={currencyFormatter.format(today.deliveredRevenue)}
          trend={
            <TrendBadge
              current={today.deliveredRevenue}
              previous={yesterday.deliveredRevenue}
              label="Delivered revenue"
            />
          }
        />
        <MetricTile
          label="Delivered orders"
          value={today.deliveredOrders.toLocaleString()}
          trend={
            <TrendBadge
              current={today.deliveredOrders}
              previous={yesterday.deliveredOrders}
              label="Delivered orders"
            />
          }
        />
      </div>
    </section>
  );
}

function MetricTile({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-50">{value}</p>
      <div className="mt-1.5">{trend}</div>
    </div>
  );
}
