/** Staff consoles — no CMP banner and no GTM. */
export function isStaffPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/manager" ||
    pathname.startsWith("/manager/")
  );
}
