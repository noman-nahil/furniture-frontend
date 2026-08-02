"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ChartRange } from "@/lib/chartRange";

const OPTIONS: { value: ChartRange; label: string }[] = [
  { value: "year", label: "This year" },
  { value: "12months", label: "Last 12 months" },
];

export function ChartRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("charts") as ChartRange) || "year";

  function setRange(range: ChartRange) {
    const params = new URLSearchParams(searchParams.toString());
    if (range === "year") {
      params.delete("charts");
    } else {
      params.set("charts", range);
    }
    const query = params.toString();
    router.push(query ? `/admin?${query}` : "/admin", { scroll: false });
  }

  return (
    <div
      role="group"
      aria-label="Chart date range"
      className="inline-flex rounded-lg border border-slate-800 bg-slate-950/50 p-0.5"
    >
      {OPTIONS.map(({ value, label }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setRange(value)}
            aria-pressed={active}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
              active
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
