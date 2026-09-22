/**
 * Global app branding and configuration
 */

export const APP_NAME = "Meubles De Paris";
export const CURRENCY = "€";
export const LOGO_PATH = "/Logo.png";

/**
 * Brand / production storefront origin (also set NEXT_PUBLIC_SITE_URL in env).
 * Override with NEXT_PUBLIC_PRODUCTION_SITE_URL.
 */
export const PRODUCTION_SITE_URL = (
  process.env.NEXT_PUBLIC_PRODUCTION_SITE_URL ||
  process.env.PRODUCTION_SITE_URL ||
  "https://meublesdeparis.com"
)
  .trim()
  .replace(/\/$/, "");

/**
 * Currency code for Intl.NumberFormat
 * EUR for Euro
 */
export const CURRENCY_CODE = "EUR";

/**
 * Locale for number formatting
 * French locale for proper number formatting with Euro
 */
export const LOCALE = "fr-FR";

/*

export const CURRENCY_CODE = "USD";

export const LOCALE = "en-US";
*/