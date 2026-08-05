/**
 * Live URL refine (debounced replace) only while already viewing results.
 * Off /products, typing updates suggestions only — commit via Enter / View all.
 */
export function shouldAutoRefineOnType(pathname: string): boolean {
  return pathname === "/products";
}

/**
 * Keep the navbar search text on:
 *   - /products (results)
 *   - /products/[slug] (product detail opened from search)
 *
 * Clear it on category / home / cart / other nav destinations.
 */
export function shouldKeepSearchQuery(pathname: string): boolean {
  if (pathname === "/products") return true;
  if (pathname.startsWith("/products/")) return true;
  return false;
}
