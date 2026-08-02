"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { MonthlyOrdersChartProps } from "@/types/monthlyOrders";
import { MonthlyOrdersStatus } from "@/components/dashboard/MonthlyOrdersStatus";

const ACCENT = "#38bdf8";
const ACCENT_SOFT = "#0ea5e9";
const GRID_LINE = "#334155";
const AXIS_TEXT = "#94a3b8";

/**
 * MonthlyOrdersChart - renders a bar chart of orders per month, plus a
 * summary header (total + month-over-month trend) and an off-screen data
 * table so the numbers are available to screen readers, which SVG charts
 * don't expose by default.
 */
export function MonthlyOrdersChart({ data }: MonthlyOrdersChartProps) {
  const { total, trendPct, hasData } = useMemo(() => {
    const hasData = data.some((item) => item.orders > 0);
    const total = data.reduce((sum, item) => sum + item.orders, 0);

    let trendPct: number | null = null;
    if (data.length >= 2) {
      const prev = data[data.length - 2].orders;
      const curr = data[data.length - 1].orders;
      if (prev > 0) trendPct = Math.round(((curr - prev) / prev) * 100);
    }

    return { total, trendPct, hasData };
  }, [data]);

  if (!data || data.length === 0) {
    return <MonthlyOrdersStatus variant="empty" />;
  }

  if (!hasData) {
    return <MonthlyOrdersStatus variant="empty" />;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      {/* NEW: same ambient-glow language as MonthlyRevenueChart, sky
          instead of emerald — so the two analytics cards read as a
          matched pair instead of the revenue card looking "designed"
          and this one looking bare next to it. */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-sky-500/10 to-transparent opacity-100 blur-3xl"
        aria-hidden
      />

      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-50">
            Monthly Orders
          </h3>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
            {total.toLocaleString()}
            <span className="ml-1.5 text-xs font-normal text-slate-500">
              total orders
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

      <div className="relative h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="ordersBarFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={1} />
                <stop offset="100%" stopColor={ACCENT_SOFT} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_LINE}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke={AXIS_TEXT}
              tickLine={false}
              axisLine={{ stroke: GRID_LINE }}
              style={{ fontSize: "0.75rem" }}
            />
            <YAxis
              stroke={AXIS_TEXT}
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "0.75rem" }}
              allowDecimals={false}
              width={32}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(4px)",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                fontSize: "0.8125rem",
              }}
              labelStyle={{ color: "#e2e8f0", marginBottom: "0.25rem" }}
              itemStyle={{ color: ACCENT }}
              formatter={(value) => {
                const numericValue =
                  typeof value === "number"
                    ? value
                    : Number.parseFloat(String(value ?? 0)) || 0;
                return [numericValue.toLocaleString(), "Orders"];
              }}
            />
            <Bar
              dataKey="orders"
              fill="url(#ordersBarFill)"
              name="Orders"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
              activeBar={{ fill: ACCENT, stroke: "none" }}
            >
              <LabelList
                dataKey="orders"
                position="top"
                style={{ fill: AXIS_TEXT, fontSize: "0.6875rem" }}
                formatter={(value) => {
                  const numericValue =
                    typeof value === "number"
                      ? value
                      : Number.parseFloat(String(value ?? 0)) || 0;
                  return numericValue > 0 ? numericValue.toLocaleString() : "";
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible fallback — SVG charts expose nothing to screen readers
          by default. This table carries the same data as plain text,
          visually hidden but reachable. */}
      <table className="sr-only">
        <caption>Orders per month</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.month}>
              <th scope="row">{item.month}</th>
              <td>{item.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MonthlyOrdersChart;