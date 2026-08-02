"use client";

import { DashboardChartStatus } from "./DashboardChartStatus";

type MonthlyOrdersStatusProps = {
  variant: "error" | "empty" | "config-error";
};

/**
 * Thin wrapper so existing imports keep working while sharing the
 * unified chart status UI with the revenue card.
 */
export function MonthlyOrdersStatus({ variant }: MonthlyOrdersStatusProps) {
  return <DashboardChartStatus variant={variant} metricLabel="orders" />;
}

export default MonthlyOrdersStatus;
