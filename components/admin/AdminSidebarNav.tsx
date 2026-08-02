"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "./adminNavItems";

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-72 border-r border-slate-800 bg-slate-950/80">
      <div className="h-16 px-6 flex items-center border-b border-slate-800">
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          Super Admin
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
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
        {APP_NAME} Admin · Full access
      </div>
    </aside>
  );
}
