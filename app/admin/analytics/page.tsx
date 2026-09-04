import { Suspense } from "react";
import { AnalyticsDateRangeSelector } from "@/components/admin/analytics/AnalyticsDateRangeSelector";
import { AnalyticsDashboardData } from "@/components/admin/analytics/AnalyticsDashboardData";
import { AnalyticsSkeleton } from "@/components/admin/analytics/AnalyticsSkeleton";
import { parseAnalyticsSearchParams } from "@/lib/analyticsRange";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = parseAnalyticsSearchParams(params);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Website traffic from Google Analytics, and sales from your orders.
          </p>
        </div>
        <Suspense fallback={null}>
          <AnalyticsDateRangeSelector />
        </Suspense>
      </header>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboardData query={range.query} />
      </Suspense>
    </div>
  );
}
