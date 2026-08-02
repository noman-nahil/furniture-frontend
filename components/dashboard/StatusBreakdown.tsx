"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardEmptyState } from "./DashboardEmptyState";

export type StatusCounts = {
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
};

type StatusKey = keyof StatusCounts;

const STATUS_META: Record<
  StatusKey,
  { label: string; dot: string; bar: string }
> = {
  PENDING: { label: "Pending", dot: "bg-amber-400", bar: "bg-amber-400" },
  CONFIRMED: { label: "Confirmed", dot: "bg-sky-400", bar: "bg-sky-400" },
  PROCESSING: { label: "Processing", dot: "bg-violet-400", bar: "bg-violet-400" },
  SHIPPED: { label: "Shipped", dot: "bg-cyan-400", bar: "bg-cyan-400" },
  DELIVERED: { label: "Delivered", dot: "bg-emerald-400", bar: "bg-emerald-400" },
  CANCELLED: { label: "Cancelled", dot: "bg-rose-400", bar: "bg-rose-400" },
};

const STATUS_ORDER: StatusKey[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

type StatusBreakdownProps = {
  statusCounts: StatusCounts;
  total: number;
};

export function StatusBreakdown({ statusCounts, total }: StatusBreakdownProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const entries = STATUS_ORDER.map((key) => ({
    key,
    count: statusCounts[key],
    ...STATUS_META[key],
  }));
  const maxCount = Math.max(...entries.map((e) => e.count), 1);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="order-status-heading" className="text-sm font-semibold text-slate-100">
          Order Status Breakdown
        </h2>
        {total > 0 && (
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-sky-400 transition-colors hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            View all
          </Link>
        )}
      </div>

      {total === 0 ? (
        <DashboardEmptyState
          title="No orders yet"
          description="When customers place orders, their status breakdown will appear here."
          action={{ href: "/admin/orders", label: "Go to orders" }}
          icon={<PipelineIcon />}
        />
      ) : (
        <ul className="space-y-2" aria-labelledby="order-status-heading">
          {entries.map((e) => {
            const pct = (e.count / maxCount) * 100;
            const href = e.count > 0 ? `/admin/orders?status=${e.key}` : undefined;

            const content = (
              <>
                <span className={`h-2 w-2 shrink-0 rounded-full ${e.dot}`} aria-hidden />
                <span className="w-20 shrink-0 text-xs text-slate-300">{e.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${e.bar} transition-[width] duration-700 ease-out motion-reduce:transition-none`}
                    style={{ width: animated ? `${pct}%` : "0%" }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-slate-200">
                  {e.count}
                </span>
              </>
            );

            if (!href) {
              return (
                <li key={e.key} className="flex items-center gap-3 opacity-50">
                  {content}
                </li>
              );
            }

            return (
              <li key={e.key}>
                <Link
                  href={href}
                  className="group flex items-center gap-3 rounded-lg px-1 py-1.5 -mx-1 transition-colors hover:bg-slate-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                  aria-label={`View ${e.count} ${e.label.toLowerCase()} order${e.count === 1 ? "" : "s"}`}
                >
                  {content}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PipelineIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 3 3 5-6" />
    </svg>
  );
}
