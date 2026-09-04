"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsChannelRow } from "@/types/adminAnalytics";

const ACCENT = "#38bdf8";
const GRID_LINE = "#334155";
const AXIS_TEXT = "#94a3b8";

export function TrafficChannelChart({ data }: { data: AnalyticsChannelRow[] }) {
  if (!data.length || data.every((row) => row.sessions === 0)) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center">
        <div>
          <p className="text-sm font-medium text-slate-100">No traffic data</p>
          <p className="mt-1 text-sm text-slate-400">
            Sessions by channel will show once Google Analytics data is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="mb-6 text-sm font-semibold text-slate-50">Traffic overview</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid stroke={GRID_LINE} strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="channel"
              width={120}
              tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #334155",
                borderRadius: 8,
              }}
              formatter={(value) => [Number(value).toLocaleString(), "Sessions"]}
            />
            <Bar dataKey="sessions" name="Sessions" fill={ACCENT} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
