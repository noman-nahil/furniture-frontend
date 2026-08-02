 "use client";

import { APP_NAME } from "@/lib/config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Protected from "@/components/auth/Protected";
import { useAuth } from "@/contexts/AuthContext";
import { Providers } from "@/app/providers";

const navItems = [
  { href: "/manager", label: "Dashboard" },
  { href: "/manager/orders", label: "Orders" },
  { href: "/manager/products", label: "Products" },
  { href: "/manager/categories", label: "Categories" },
  { href: "/manager/subcategories", label: "Subcategories" },
  { href: "/manager/banners", label: "Banners" },
  { href: "/manager/homepage-sections", label: "Homepage sections" },
  { href: "/manager/settings", label: "Settings" },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  function handleLogout() {
    void logout();
  }

  return (
    <Providers>
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-800 bg-slate-950/80">
        <div className="h-16 px-6 flex items-center border-b border-slate-800">
          <Link href="/manager" className="text-lg font-semibold tracking-tight">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/manager"
                ? pathname === "/manager"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 text-xs text-slate-500 border-t border-slate-800">
          {APP_NAME} Admin
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur flex items-center justify-between px-4 md:px-8">
          <div>
            <h1 className="text-base md:text-lg font-semibold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Manage products, orders, categories and customers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs md:text-sm text-slate-300 hover:text-white"
            >
              View Storefront
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-slate-600 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 bg-slate-950/90">
          <Protected allow={["admin", "manager"]}>{children}</Protected>
        </main>
      </div>
    </div>
    </Providers>
  );
}

