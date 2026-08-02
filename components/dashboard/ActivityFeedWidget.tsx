import Link from "next/link";
import { CURRENCY_CODE, LOCALE } from "@/lib/config";
import { DashboardEmptyState } from "./DashboardEmptyState";

export type ActivityEvent = {
  type: "order_created" | "status_changed";
  orderId: string;
  status: string;
  amount?: number;
  customerName?: string;
  at: string;
};

type ActivityFeedWidgetProps = {
  events: ActivityEvent[];
};

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
});

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function formatRelativeTime(iso: string) {
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString(LOCALE, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function describeEvent(event: ActivityEvent): string {
  const shortId = event.orderId.slice(-8);
  const status = STATUS_LABEL[event.status] ?? event.status;

  if (event.type === "order_created") {
    const customer = event.customerName ? ` from ${event.customerName}` : "";
    const amount =
      typeof event.amount === "number"
        ? ` — ${currencyFormatter.format(event.amount)}`
        : "";
    return `New order #${shortId}${customer}${amount}`;
  }

  return `Order #${shortId} → ${status}`;
}

export function ActivityFeedWidget({ events }: ActivityFeedWidgetProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="activity-feed-heading" className="text-sm font-semibold text-slate-100">
          Activity
        </h2>
        {events.length > 0 && (
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-sky-400 transition-colors hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            View all
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <DashboardEmptyState
          title="No recent activity"
          description="Order updates and new orders will appear here."
          action={{ href: "/admin/orders", label: "Go to orders" }}
          icon={<ActivityIcon />}
        />
      ) : (
        <ul
          className="max-h-72 space-y-1 overflow-y-auto"
          aria-labelledby="activity-feed-heading"
        >
          {events.map((event, index) => {
            const shortId = event.orderId.slice(-8);
            return (
              <li key={`${event.orderId}-${event.type}-${event.at}-${index}`}>
                <Link
                  href={`/admin/orders?q=${encodeURIComponent(shortId)}`}
                  className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      event.type === "order_created" ? "bg-sky-400" : "bg-violet-400"
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-slate-200">{describeEvent(event)}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {formatRelativeTime(event.at)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ActivityIcon() {
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
      <path d="M12 8v4l3 3" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
