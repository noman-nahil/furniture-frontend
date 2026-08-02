// features/checkout/constants.ts

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How long to show the stock-adjustment toast before redirecting back to /cart. */
export const STOCK_ADJUSTMENT_REDIRECT_DELAY_MS = 2000;

export const EMPTY_DELIVERY_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  area: "",
};