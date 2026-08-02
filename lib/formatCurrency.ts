import { CURRENCY, CURRENCY_CODE, LOCALE } from "./config";

/**
 * Format a number as currency using Intl.NumberFormat
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "€ 1,234.00")
 */
export function formatCurrency(amount: number | undefined | null): string {
  const safeAmount = amount ?? 0;

  try {
    const formatter = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: CURRENCY_CODE,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(safeAmount);
  } catch {
    // Fallback if Intl fails (e.g., in certain environments)
    return `${CURRENCY} ${safeAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }
}

/**
 * Alternative formatter that returns amount only (without currency symbol)
 * Useful for tables or compact displays
 * @param amount - The amount to format
 * @returns Formatted amount string (e.g., "1,234.00")
 */
export function formatAmount(amount: number | undefined | null): string {
  const safeAmount = amount ?? 0;

  try {
    const formatter = new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(safeAmount);
  } catch {
    // Fallback
    return safeAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
