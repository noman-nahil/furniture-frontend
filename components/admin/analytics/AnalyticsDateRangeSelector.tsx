"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ANALYTICS_PRESETS,
  analyticsPageHref,
  parseAnalyticsSearchParams,
  type AnalyticsPreset,
} from "@/lib/analyticsRange";

export function AnalyticsDateRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const parsed = parseAnalyticsSearchParams({
    preset: searchParams.get("preset") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const [customFrom, setCustomFrom] = useState(
    parsed.kind === "custom" ? parsed.from : "",
  );
  const [customTo, setCustomTo] = useState(
    parsed.kind === "custom" ? parsed.to : "",
  );

  function go(href: string) {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  function selectPreset(preset: AnalyticsPreset) {
    go(
      analyticsPageHref({
        kind: "preset",
        preset,
        query: preset === "last_7_days" ? "" : `preset=${preset}`,
      }),
    );
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    go(
      analyticsPageHref({
        kind: "custom",
        from: customFrom,
        to: customTo,
        query: `from=${encodeURIComponent(customFrom)}&to=${encodeURIComponent(customTo)}`,
      }),
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div
        role="group"
        aria-label="Analytics date range"
        className="flex flex-wrap gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-0.5"
      >
        {ANALYTICS_PRESETS.map(({ value, label }) => {
          const active = parsed.kind === "preset" && parsed.preset === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => selectPreset(value)}
              aria-pressed={active}
              disabled={isPending}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 disabled:opacity-60 ${
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

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          applyCustom();
        }}
      >
        <label className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          From
          <input
            type="date"
            value={customFrom}
            onChange={(event) => setCustomFrom(event.target.value)}
            className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200"
          />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          To
          <input
            type="date"
            value={customTo}
            onChange={(event) => setCustomTo(event.target.value)}
            className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200"
          />
        </label>
        <button
          type="submit"
          disabled={isPending || !customFrom || !customTo}
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>
      </form>
    </div>
  );
}
