"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MonthlyRevenueChartProps } from "@/types/monthlyRevenue";
import { CURRENCY_CODE, LOCALE } from "@/lib/config";

// CHANGED: realigned to the semantic color language already established
// elsewhere on this dashboard — emerald = revenue/money (matches the
// "Total Revenue" DashboardCard and the DELIVERED status color), sky =
// order counts (matches the "Total Orders" DashboardCard). Previously
// this chart used cyan/violet, which didn't correspond to anything else
// on the page — the chart looked like a different design system than the
// cards sitting right next to it.
const REVENUE_ACCENT = "#10b981"; // emerald-500
const ORDERS_ACCENT = "#38bdf8";  // sky-400
const GRID_LINE = "#334155";
const AXIS_TEXT = "#94a3b8";

function formatRevenueCurrency(value: number) {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: { month: string };
  }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/95 p-3 text-sm shadow-lg backdrop-blur-sm">
      <p className="font-medium text-slate-200">{payload[0].payload.month}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-xs font-medium"
            style={{ color: entry.color }}
          >
            {entry.name}:{" "}
            {entry.name === "Revenue"
              ? formatRevenueCurrency(entry.value)
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * MonthlyRevenueChart — primary analytics card with revenue area + orders
 * line overlay. Matches the orders chart shell (border, padding, header)
 * and includes an sr-only table for screen readers.
 */
export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const { totalRevenue, trendPct, peakIndex } = useMemo(() => {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

    let trendPct: number | null = null;
    if (data.length >= 2) {
      const prev = data[data.length - 2].revenue;
      const curr = data[data.length - 1].revenue;
      if (prev > 0) trendPct = Math.round(((curr - prev) / prev) * 100);
    }

    // NEW: index of the highest-revenue month, used to render a single
    // highlighted dot on the area line — a small "look here" focal point
    // that most bare recharts implementations skip, and one of the more
    // recognizable details of a "designed" analytics chart vs. a default one.
    let peakIndex = -1;
    let peakValue = -Infinity;
    data.forEach((item, i) => {
      if (item.revenue > peakValue) {
        peakValue = item.revenue;
        peakIndex = i;
      }
    });

    return { totalRevenue, trendPct, peakIndex };
  }, [data]);

  const formatCurrency = formatRevenueCurrency;

  // NEW: custom dot renderer for the revenue area — renders nothing for
  // ordinary points (keeps the line clean) but a highlighted ring+dot at
  // the peak-revenue month, so there's a permanent focal point on the
  // chart even when the user isn't hovering.
  const renderRevenueDot = (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props;
    if (index !== peakIndex || cx == null || cy == null) {
      return <g key={`dot-${index}`} />;
    }
    return (
      <g key={`dot-${index}`}>
        <circle cx={cx} cy={cy} r={7} fill={REVENUE_ACCENT} fillOpacity={0.18} />
        <circle cx={cx} cy={cy} r={3.5} fill={REVENUE_ACCENT} stroke="#0f172a" strokeWidth={2} />
      </g>
    );
  };

  return (
    <div className="relative min-h-80 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 lg:min-h-96">
      {/* NEW: ambient glow, same visual language as DashboardCard's hover
          glow — ties this chart into the rest of the dashboard's design
          system instead of feeling like a bare library default sitting
          in a plain box. Subtle and always-on (not hover-gated) since a
          chart is the page's primary content, not a secondary link card. */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent opacity-100 blur-3xl"
        aria-hidden
      />

      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-50">Monthly Revenue</h3>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
            {formatCurrency(totalRevenue)}
            <span className="ml-1.5 text-xs font-normal text-slate-500">
              total revenue
            </span>
          </p>
        </div>

        {trendPct !== null && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${
              trendPct >= 0
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              className={trendPct < 0 ? "rotate-180" : ""}
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
            {trendPct >= 0 ? "+" : ""}
            {trendPct}%
          </span>
        )}
      </div>

      <div className="relative h-64 w-full lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 32, left: 0, bottom: 0 }}
          >
            <defs>
              {/* CHANGED: three-stop gradient instead of two — a richer
                  falloff than a flat linear fade, more depth without
                  being heavier. */}
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REVENUE_ACCENT} stopOpacity={0.45} />
                <stop offset="60%" stopColor={REVENUE_ACCENT} stopOpacity={0.12} />
                <stop offset="100%" stopColor={REVENUE_ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_LINE}
              vertical={false}
              yAxisId="left"
            />

            <XAxis
              dataKey="month"
              stroke={AXIS_TEXT}
              tickLine={false}
              axisLine={{ stroke: GRID_LINE }}
              style={{ fontSize: "0.75rem" }}
            />

            <YAxis
              yAxisId="left"
              stroke={AXIS_TEXT}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "0.75rem" }}
              width={40}
              tickFormatter={(value) =>
                value === 0 ? "0" : `$${(value / 1000).toFixed(0)}k`
              }
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={AXIS_TEXT}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "0.75rem" }}
              width={28}
              allowDecimals={false}
              // CHANGED: was unformatted (inconsistent with the left axis's
              // $Xk formatting) — now matches with a plain thousands
              // separator, so both axes read as deliberately styled
              // rather than one polished and one left at the recharts
              // default.
              tickFormatter={(value) => value.toLocaleString()}
            />

            {/* CHANGED: was cursor={false} (no hover feedback line at
                all) — a dashed vertical guide on hover is close to
                universal in analytics dashboards (Stripe, Vercel, Linear
                all have one) and its absence is part of why this read as
                a "default" chart rather than a designed one. */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: GRID_LINE, strokeDasharray: "3 3", strokeWidth: 1 }}
            />

            <Legend
              wrapperStyle={{ paddingTop: "0.75rem" }}
              iconType="line"
              formatter={(value) => (
                <span className="text-xs font-medium text-slate-300">{value}</span>
              )}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke={REVENUE_ACCENT}
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="Revenue"
              dot={renderRevenueDot}
              activeDot={{
                r: 5,
                fill: REVENUE_ACCENT,
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke={ORDERS_ACCENT}
              strokeWidth={2}
              dot={{ fill: ORDERS_ACCENT, r: 2.5 }}
              activeDot={{
                r: 4,
                fill: ORDERS_ACCENT,
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              name="Orders"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Revenue and orders per month</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Revenue</th>
            <th scope="col">Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.month}>
              <th scope="row">{item.month}</th>
              <td>{formatCurrency(item.revenue)}</td>
              <td>{item.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MonthlyRevenueChart;