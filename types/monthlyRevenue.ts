/**
 * Monthly Revenue Analytics Types
 * TypeScript interfaces for the monthly revenue feature
 */

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface MonthlyRevenueResponse {
  data: MonthlyRevenueData[];
}

export interface MonthlyRevenueChartProps {
  data: MonthlyRevenueData[];
}
