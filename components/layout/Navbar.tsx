import NavbarClient from "./NavbarClient";
import TopBar from "./TopBar";
import type { CategoryNav } from "@/types/categoryNav";
import { getServerUser } from "@/lib/auth/getServerUser";
import { getNavbarCategories } from "@/lib/navbarCategories";

export type { CategoryNav };

export default async function Navbar() {
  // Fetch in parallel so category data isn't blocked on auth.
  const [categories, user] = await Promise.all([
    getNavbarCategories(),
    getServerUser(),
  ]);

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
