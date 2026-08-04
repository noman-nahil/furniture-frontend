/**
 * Live URL refine (debounced replace) only while already viewing results.
 * Off /products, typing updates suggestions only — commit via Enter / View all.
 */
export function shouldAutoRefineOnType(pathname: string): boolean {
  return pathname === "/products";
}
