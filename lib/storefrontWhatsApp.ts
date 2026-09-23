/** Pages where the floating WhatsApp button must not appear. */
const EXCLUDED_PREFIXES = [
  "/admin",
  "/manager",
  "/dashboard",
  "/checkout",
  "/cart",
  "/login",
  "/register",
  "/maintenance",
] as const;

export const WHATSAPP_URL = "https://wa.me/33753305109";
export const WHATSAPP_LABEL = "Contactez-nous sur WhatsApp";

function normalizePath(pathname: string): string {
  const path = (pathname.split("#")[0] ?? "").split("?")[0] ?? "";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

/** True on public storefront routes, including home and content pages. */
export function isStorefrontWhatsAppPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = normalizePath(pathname);
  if (!path.startsWith("/")) return false;
  return !EXCLUDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
