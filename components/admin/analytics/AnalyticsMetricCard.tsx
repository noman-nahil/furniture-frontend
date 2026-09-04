type Accent = "sky" | "emerald" | "amber" | "violet";

const VALUE_COLOR: Record<Accent, string> = {
  sky: "text-slate-50",
  emerald: "text-slate-50",
  amber: "text-slate-50",
  violet: "text-slate-50",
};

export function AnalyticsMetricCard({
  title,
  value,
  subtitle,
  accent = "sky",
  muted = false,
}: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: Accent;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="mb-1.5 truncate text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p
        className={`text-2xl font-semibold tabular-nums ${
          muted ? "text-slate-500" : VALUE_COLOR[accent]
        }`}
      >
        {value}
      </p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
