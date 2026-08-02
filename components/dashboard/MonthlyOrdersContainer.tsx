import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MonthlyOrdersChart } from "@/components/dashboard/MonthlyOrdersChart";
import { MonthlyOrdersSkeleton } from "@/components/dashboard/MonthlyOrdersSkeleton";
import { MonthlyOrdersStatus } from "@/components/dashboard/MonthlyOrdersStatus";
import { MonthlyOrderData } from "@/types/monthlyOrders";

/**
 * Runtime shape check for the API response. Without this, a backend
 * change (renamed field, wrapped-in-an-object response, etc.) would
 * either throw deep inside recharts or silently render an empty/wrong
 * chart instead of surfacing a clear error.
 */
function isMonthlyOrderDataArray(value: unknown): value is MonthlyOrderData[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as MonthlyOrderData).month === "string" &&
        typeof (item as MonthlyOrderData).orders === "number",
    )
  );
}

async function MonthlyOrdersData({
  chartRange,
}: {
  chartRange: "year" | "12months";
}) {
  const cookieStore = await cookies();
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    console.error("[MonthlyOrders] BACKEND_URL is not set");
    return <MonthlyOrdersStatus variant="config-error" />;
  }

  let monthlyData: unknown;
  let fetchFailed = false;

  try {
    const query = chartRange === "12months" ? "?range=12months" : "";
    const response = await fetch(
      `${baseUrl}/dashboard/monthly-orders${query}`,
      {
        headers: {
          Cookie: cookieStore.toString(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (response.status === 401) {
      redirect("/login?reason=session_expired");
    }

    if (!response.ok) {
      console.error(
        "[MonthlyOrders] Failed to fetch monthly orders data:",
        response.statusText,
      );
      fetchFailed = true;
    } else {
      monthlyData = await response.json();
    }
  } catch (error) {
    console.error("[MonthlyOrders] Error fetching monthly orders data:", error);
    fetchFailed = true;
  }

  if (fetchFailed) {
    return <MonthlyOrdersStatus variant="error" />;
  }

  if (!isMonthlyOrderDataArray(monthlyData)) {
    console.error("[MonthlyOrders] Unexpected response shape:", monthlyData);
    return <MonthlyOrdersStatus variant="error" />;
  }

  if (monthlyData.length === 0) {
    return <MonthlyOrdersStatus variant="empty" />;
  }

  return <MonthlyOrdersChart data={monthlyData} />;
}

/**
 * MonthlyOrdersContainer - fetches monthly orders data server-side and
 * renders the chart. Wrapped in Suspense so the rest of the dashboard
 * can render immediately while this card streams in behind a skeleton,
 * instead of blocking the whole page on this one fetch.
 */
export function MonthlyOrdersContainer({
  chartRange = "year",
}: {
  chartRange?: "year" | "12months";
}) {
  return (
    <Suspense fallback={<MonthlyOrdersSkeleton />}>
      <MonthlyOrdersData chartRange={chartRange} />
    </Suspense>
  );
}

export default MonthlyOrdersContainer;
