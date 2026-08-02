export type ChartRange = "year" | "12months";

export function parseChartRange(value: string | undefined): ChartRange {
  return value === "12months" ? "12months" : "year";
}

export function chartRangeQuery(range: ChartRange): string {
  if (range === "12months") return "?range=12months";
  return "";
}
