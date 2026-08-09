import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import NavbarClient from "./NavbarClient";
import TopBar from "./TopBar";
import type { CategoryNav } from "@/types/categoryNav";
import { getServerUser } from "@/lib/auth/getServerUser";

export type { CategoryNav };

export default async function Navbar() {
  // Fetch in parallel so category data isn't blocked on auth.
  const [res, user] = await Promise.all([
    serverFetch<CategoryNav[]>("/categories/active"),
    getServerUser(),
  ]);

  // Keep parents with showInNavbar === false off the menu; /categories still
  // lists their subcategories via GET /subcategories/active.
  const categories: CategoryNav[] = isServerFetchError(res)
    ? []
    : Array.isArray(res)
      ? res.filter((c) => c.showInNavbar !== false)
      : [];

  return (
    // Sticky lives here, on the wrapper — not on TopBar or on the <nav>
    // inside NavbarClient individually — so the tagline bar and the nav
    // stick together as one unit instead of the bar scrolling away on
    // its own while the nav sticks alone.
    <div className="sticky top-0 z-50">
      <TopBar />
      <NavbarClient categories={categories} user={user} />
    </div>
  );
}
