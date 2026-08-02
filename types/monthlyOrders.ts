/**
 * Monthly Orders Analytics Types
 * TypeScript interfaces for the monthly orders feature
 */

export interface MonthlyOrderData {
  month: string;
  orders: number;
}

export interface MonthlyOrdersResponse {
  data: MonthlyOrderData[];
}

export interface MonthlyOrdersChartProps {
  data: MonthlyOrderData[];
}
