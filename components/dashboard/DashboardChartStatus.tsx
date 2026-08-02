"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type DashboardChartStatusProps = {
  variant: "error" | "empty" | "config-error";
  metricLabel: string;
};

function getCopy(metricLabel: string, variant: DashboardChartStatusProps["variant"]) {
  switch (variant) {
    case "error":
      return {
        title: `Couldn't load ${metricLabel} data`,
        body: "The request failed. Check your connection and try again.",
        showRetry: true,
      };
    case "config-error":
      return {
        title: "Analytics isn't configured",
        body: "The backend connection for this dashboard hasn't been set up yet. Contact an admin.",
        showRetry: false,
      };
    case "empty":
      return {
        title: `No ${metricLabel} data yet`,
        body: `Once activity starts, monthly ${metricLabel} totals will show up here.`,
        showRetry: false,
      };
  }
}

export function DashboardChartStatus({ variant, metricLabel }: DashboardChartStatusProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [attempted, setAttempted] = useState(false);
  const copy = getCopy(metricLabel, variant);

  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center lg:min-h-96">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800"
        aria-hidden
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {variant === "empty" ? (
            <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />
          ) : (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </>
          )}
        </svg>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-100">{copy.title}</p>
        <p className="max-w-xs text-sm text-slate-400">{copy.body}</p>
      </div>

      {copy.showRetry && (
        <button
          type="button"
          onClick={() => {
            setAttempted(true);
            startTransition(() => router.refresh());
          }}
          disabled={isPending}
          className="mt-1 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Retrying…" : attempted ? "Try again" : "Retry"}
        </button>
      )}
    </div>
  );
}
