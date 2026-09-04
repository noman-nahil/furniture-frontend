"use client";

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
import { CURRENCY_CODE, LOCALE } from "@/lib/config";
import type { AnalyticsSalesDay } from "@/types/adminAnalytics";

const REVENUE_ACCENT = "#10b981";
const ORDERS_ACCENT = "#38bdf8";
const GRID_LINE = "#334155";
const AXIS_TEXT = "#94a3b8";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

function formatDayLabel(date: string) {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

export function SalesByDayChart({ data }: { data: AnalyticsSalesDay[] }) {
  const chartData = data.map((row) => ({
    ...row,
    label: formatDayLabel(row.date),
  }));
  const totalRevenue = data.reduce((sum, row) => sum + row.revenue, 0);
  const hasData = data.some((row) => row.revenue > 0 || row.orders > 0);

  if (!hasData) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center">
        <div>
          <p className="text-sm font-medium text-slate-100">No order data yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Delivered revenue and orders will appear here for this range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-50">Revenue & orders</h3>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
          {currency.format(totalRevenue)}
          <span className="ml-1.5 text-xs font-normal text-slate-500">
            delivered revenue
          </span>
        </p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REVENUE_ACCENT} stopOpacity={0.35} />
                <stop offset="100%" stopColor={REVENUE_ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID_LINE} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS_TEXT, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="revenue"
              tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => currency.format(value)}
              width={72}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #334155",
                borderRadius: 8,
              }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value, name) =>
                name === "Revenue"
                  ? [currency.format(Number(value)), "Revenue"]
                  : [Number(value).toLocaleString(), String(name)]
              }
            />
            <Legend />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={REVENUE_ACCENT}
              fill="url(#analyticsRevenue)"
              strokeWidth={2}
            />
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke={ORDERS_ACCENT}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
