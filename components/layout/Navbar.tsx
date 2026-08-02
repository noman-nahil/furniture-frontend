import { Suspense } from "react";
import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import NavbarClient from "./NavbarClient";
import TopBar from "./TopBar";
import type { CategoryNav } from "@/types/categoryNav";
import { getServerUser } from "@/lib/auth/getServerUser";

export type { CategoryNav };

export default async function Navbar() {
  const res = await serverFetch<CategoryNav[]>("/categories/active");
  const categories: CategoryNav[] = isServerFetchError(res)
    ? []
    : Array.isArray(res)
      ? res
      : [];

  const user = await getServerUser();

  return (
    // Sticky lives here, on the wrapper — not on TopBar or on the <nav>
    // inside NavbarClient individually — so the tagline bar and the nav
    // stick together as one unit instead of the bar scrolling away on
    // its own while the nav sticks alone.
    <div className="sticky top-0 z-50">
      <TopBar />
      <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
        <NavbarClient categories={categories} user={user} />
      </Suspense>
    </div>
  );
}