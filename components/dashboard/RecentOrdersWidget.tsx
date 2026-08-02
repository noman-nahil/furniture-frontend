import Link from "next/link";
import { CURRENCY_CODE, LOCALE } from "@/lib/config";
import { DashboardEmptyState } from "./DashboardEmptyState";

export type RecentOrder = {
  _id: string;
  status: string;
  subtotal: number;
  createdAt: string;
  deliveryAddress: {
    name: string;
  };
};

type RecentOrdersWidgetProps = {
  orders: RecentOrder[];
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  CONFIRMED: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  PROCESSING: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  SHIPPED: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
});

function formatOrderDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(LOCALE, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function RecentOrdersWidget({ orders }: RecentOrdersWidgetProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recent-orders-heading" className="text-sm font-semibold text-slate-100">
          Recent Orders
        </h2>
        {orders.length > 0 && (
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-sky-400 transition-colors hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            View all
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <DashboardEmptyState
          title="No orders yet"
          description="New orders will show up here as they come in."
          action={{ href: "/admin/orders", label: "Go to orders" }}
          icon={<OrdersIcon />}
        />
      ) : (
        <ul
          className="max-h-72 space-y-2 overflow-y-auto"
          aria-labelledby="recent-orders-heading"
        >
          {orders.map((order) => {
            const shortId = order._id.slice(-8);
            return (
              <li key={order._id}>
                <Link
                  href={`/admin/orders?q=${encodeURIComponent(shortId)}`}
                  className="block rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2.5 transition-colors hover:border-slate-700 hover:bg-slate-900/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                  aria-label={`Order ${shortId}, ${order.status}, ${currencyFormatter.format(order.subtotal)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium text-slate-200">
                      #{shortId}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        STATUS_BADGE[order.status] ??
                        "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-slate-400">
                      {order.deliveryAddress?.name ?? "—"}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-slate-200">
                      {currencyFormatter.format(order.subtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OrdersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5Z" />
      <path d="M3 7h18M16 11a4 4 0 0 1-8 0" />
    </svg>
  );
}
