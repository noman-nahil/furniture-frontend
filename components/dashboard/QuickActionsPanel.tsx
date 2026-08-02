import Link from "next/link";

const ACTIONS = [
  { href: "/admin/orders", label: "Manage Orders", primary: true },
  { href: "/admin/products", label: "Manage Products", primary: false },
  { href: "/admin/users", label: "Manage Users", primary: false },
  { href: "/admin/settings", label: "Settings", primary: false },
] as const;

export function QuickActionsPanel() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 id="quick-actions-heading" className="mb-3 text-sm font-semibold text-slate-100">
        Quick Actions
      </h2>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        aria-labelledby="quick-actions-heading"
      >
        {ACTIONS.map(({ href, label, primary }) => (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
              primary
                ? "bg-slate-100 text-slate-900 hover:bg-white"
                : "border border-slate-700 text-slate-200 hover:bg-slate-800"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
