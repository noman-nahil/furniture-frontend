import { fetchAnalyticsDashboard } from "./fetchAnalyticsDashboard";
import { AnalyticsDashboardView } from "./AnalyticsDashboardView";
import { DashboardChartStatus } from "@/components/dashboard/DashboardChartStatus";

export async function AnalyticsDashboardData({ query }: { query: string }) {
  const result = await fetchAnalyticsDashboard(query);

  if (!result.ok) {
    if (result.kind === "config") {
      return <DashboardChartStatus variant="config-error" metricLabel="analytics" />;
    }
    if (result.kind === "bad_range") {
      return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-100">Invalid date range</p>
          <p className="mt-1 text-sm text-slate-400">
            Choose a preset or a from/to range of at most 366 days.
          </p>
        </div>
      );
    }
    return <DashboardChartStatus variant="error" metricLabel="analytics" />;
  }

  return <AnalyticsDashboardView data={result.data} />;
}
