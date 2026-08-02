import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MonthlyRevenueChart } from "./MonthlyRevenueChart";
import { MonthlyRevenueSkeleton } from "./MonthlyRevenueSkeleton";
import { DashboardChartStatus } from "./DashboardChartStatus";
import type { MonthlyRevenueData } from "@/types/monthlyRevenue";

function isMonthlyRevenueDataArray(value: unknown): value is MonthlyRevenueData[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as MonthlyRevenueData).month === "string" &&
        typeof (item as MonthlyRevenueData).revenue === "number" &&
        typeof (item as MonthlyRevenueData).orders === "number",
    )
  );
}

async function MonthlyRevenueData({ chartRange }: { chartRange: "year" | "12months" }) {
  const cookieStore = await cookies();
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    console.error("[MonthlyRevenue] BACKEND_URL is not set");
    return <DashboardChartStatus variant="config-error" metricLabel="revenue" />;
  }

  let monthlyData: unknown;

  try {
    const query = chartRange === "12months" ? "?range=12months" : "";
    const response = await fetch(`${baseUrl}/dashboard/monthly-revenue${query}`, {
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      redirect("/login?reason=session_expired");
    }

    if (!response.ok) {
      console.error(
        "[MonthlyRevenue] Failed to fetch monthly revenue data:",
        response.statusText,
      );
      return <DashboardChartStatus variant="error" metricLabel="revenue" />;
    }

    monthlyData = await response.json();
  } catch (error) {
    console.error("[MonthlyRevenue] Error fetching monthly revenue data:", error);
    return <DashboardChartStatus variant="error" metricLabel="revenue" />;
  }

  if (!isMonthlyRevenueDataArray(monthlyData)) {
    console.error("[MonthlyRevenue] Unexpected response shape:", monthlyData);
    return <DashboardChartStatus variant="error" metricLabel="revenue" />;
  }

  if (monthlyData.length === 0) {
    return <DashboardChartStatus variant="empty" metricLabel="revenue" />;
  }

  const hasData = monthlyData.some((item) => item.revenue > 0 || item.orders > 0);
  if (!hasData) {
    return <DashboardChartStatus variant="empty" metricLabel="revenue" />;
  }

  return <MonthlyRevenueChart data={monthlyData} />;
}

export function MonthlyRevenueContainer({
  chartRange = "year",
}: {
  chartRange?: "year" | "12months";
}) {
  return (
    <Suspense fallback={<MonthlyRevenueSkeleton />}>
      <MonthlyRevenueData chartRange={chartRange} />
    </Suspense>
  );
}

export default MonthlyRevenueContainer;
