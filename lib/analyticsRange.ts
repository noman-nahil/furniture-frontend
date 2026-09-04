export const ANALYTICS_PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
] as const;

export type AnalyticsPreset = (typeof ANALYTICS_PRESETS)[number]["value"];

const PRESET_VALUES = new Set<string>(ANALYTICS_PRESETS.map((item) => item.value));

export type ParsedAnalyticsRange =
  | { kind: "preset"; preset: AnalyticsPreset; query: string }
  | { kind: "custom"; from: string; to: string; query: string };

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isYmd(value: string): boolean {
  return YMD_RE.test(value);
}

export function parseAnalyticsSearchParams(params: {
  preset?: string;
  from?: string;
  to?: string;
}): ParsedAnalyticsRange {
  const from = params.from?.trim() ?? "";
  const to = params.to?.trim() ?? "";

  if (from && to && isYmd(from) && isYmd(to)) {
    return {
      kind: "custom",
      from,
      to,
      query: `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    };
  }

  const preset = PRESET_VALUES.has(params.preset ?? "")
    ? (params.preset as AnalyticsPreset)
    : "last_7_days";

  return {
    kind: "preset",
    preset,
    query: preset === "last_7_days" ? "" : `preset=${encodeURIComponent(preset)}`,
  };
}

export function analyticsPageHref(range: ParsedAnalyticsRange): string {
  return range.query ? `/admin/analytics?${range.query}` : "/admin/analytics";
}
