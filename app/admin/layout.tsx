import Link from "next/link";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { Providers } from "@/app/providers";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">      <AdminSidebarNav />

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur flex items-center justify-between px-4 md:px-8">
          <div>
            <h1 className="text-base md:text-lg font-semibold tracking-tight">
              Admin Console
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Full control over store configuration, catalog and users.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs md:text-sm text-slate-300 hover:text-white"
            >
              View Storefront
            </Link>
            <AdminLogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 bg-slate-950/90">{children}</main>
      </div>
    </div>
    </Providers>
  );
}