"use client";

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  Fragment,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/authClient";
import { formatCurrency } from "@/lib/formatCurrency";
import { pickLocale } from "@/lib/locale";
import type { LocalizedField } from "@/types/product";
import Link from "next/link";

type OrderItem = {
  productId: string;
  name: LocalizedField;
  price: number;
  quantity: number;
  slug?: LocalizedField;
  image?: string;
};

type DeliveryAddress = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area?: string;
};

type Order = {
  _id: string;
  trackingToken?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryAddress: DeliveryAddress;
  deliveryType: string;
  status: string;
  createdAt: string;
};

type OrderListResponse = {
  data: Order[];
};

type StatusKey =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const STATUS_OPTIONS: StatusKey[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

// Color coding shared between stat chips and the status select — status is
// scanned by eye far more than it's read as text, so color is doing real
// information work here, not just decoration.
const STATUS_META: Record<
  StatusKey,
  { label: string; dot: string; chipActive: string; selectClass: string }
> = {
  PENDING: {
    label: "Pending",
    dot: "bg-amber-400",
    chipActive: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    selectClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  CONFIRMED: {
    label: "Confirmed",
    dot: "bg-sky-400",
    chipActive: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    selectClass: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  PROCESSING: {
    label: "Processing",
    dot: "bg-violet-400",
    chipActive: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    selectClass: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
  SHIPPED: {
    label: "Shipped",
    dot: "bg-cyan-400",
    chipActive: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    selectClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  DELIVERED: {
    label: "Delivered",
    dot: "bg-emerald-400",
    chipActive: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    selectClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-rose-400",
    chipActive: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    selectClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
};

type DateFilterKey = "ALL_TIME" | "TODAY" | "WEEK" | "MONTH" | "YEAR" | "CUSTOM";

const DATE_FILTER_LABELS: Record<DateFilterKey, string> = {
  ALL_TIME: "All time",
  TODAY: "Today",
  WEEK: "This week",
  MONTH: "This month",
  YEAR: "This year",
  CUSTOM: "Custom range",
};

function formatDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

// Returns [start, end) bounds for the selected date filter, or null if the
// filter shouldn't restrict the range (all-time, or an incomplete custom
// range). Weeks start Monday.
function getDateRangeBounds(
  filter: DateFilterKey,
  customFrom: string,
  customTo: string,
): { start: Date; end: Date } | null {
  const now = new Date();

  switch (filter) {
    case "TODAY": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    case "WEEK": {
      const day = now.getDay(); // 0 = Sunday
      const diffToMonday = (day + 6) % 7;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end };
    }
    case "MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start, end };
    }
    case "YEAR": {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear() + 1, 0, 1);
      return { start, end };
    }
    case "CUSTOM": {
      if (!customFrom || !customTo) return null;
      const start = new Date(customFrom);
      const end = new Date(customTo);
      end.setDate(end.getDate() + 1); // inclusive of the "to" day
      return { start, end };
    }
    default:
      return null;
  }
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [dateFilter, setDateFilter] = useState<DateFilterKey>("ALL_TIME");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Deep-link support from overview dashboard (?status=PENDING, ?q=abc123, ?date=TODAY)
  useEffect(() => {
    const status = searchParams.get("status");
    if (status && STATUS_OPTIONS.includes(status as StatusKey)) {
      setFilterStatus(status);
    }

    const q = searchParams.get("q");
    if (q) setSearchQuery(q);

    const date = searchParams.get("date");
    if (date === "TODAY") setDateFilter("TODAY");
  }, [searchParams]);

  const load = useCallback(async () => {
    let cancelled = false;
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<OrderListResponse>("/orders");
      if (!cancelled) {
        setOrders(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Failed to load orders.");
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    load().then((c) => {
      cleanup = c;
    });
    return () => cleanup?.();
  }, [load]);

  // ✅ Single pass instead of 6x .filter() over the same array on every
  //    render, and memoized so it doesn't redo work on unrelated state
  //    changes (e.g. expanding a row).
  const orderStats = useMemo(() => {
    const statusCounts: Record<StatusKey, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const o of orders) {
      if (o.status in statusCounts) {
        statusCounts[o.status as StatusKey] += 1;
      }
    }
    return { totalOrders: orders.length, statusCounts };
  }, [orders]);

  const dateBounds = useMemo(
    () => getDateRangeBounds(dateFilter, customFrom, customTo),
    [dateFilter, customFrom, customTo],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedQueryDigits = normalizedQuery.replace(/\D/g, "");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterStatus !== "ALL" && order.status !== filterStatus) return false;

      if (dateBounds) {
        const created = new Date(order.createdAt);
        if (created < dateBounds.start || created >= dateBounds.end) return false;
      }

      if (!normalizedQuery) return true;

      const id = (order._id ?? "").toLowerCase();
      const email = (order.deliveryAddress?.email ?? "").toLowerCase();
      const phoneDigits = String(order.deliveryAddress?.phone ?? "").replace(/\D/g, "");

      const queryMatchesId = id.includes(normalizedQuery);
      const queryMatchesEmail = email.includes(normalizedQuery);
      const queryMatchesPhone =
        normalizedQueryDigits.length > 0 && phoneDigits.includes(normalizedQueryDigits);

      return queryMatchesId || queryMatchesEmail || queryMatchesPhone;
    });
  }, [orders, filterStatus, dateBounds, normalizedQuery, normalizedQueryDigits]);

  async function handleStatusChange(orderId: string, status: string) {
    try {
      setUpdatingId(orderId);
      const updated = await apiFetch<Order>(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const hasActiveFilters =
    filterStatus !== "ALL" || dateFilter !== "ALL_TIME" || normalizedQuery.length > 0;

  function clearFilters() {
    setFilterStatus("ALL");
    setDateFilter("ALL_TIME");
    setCustomFrom("");
    setCustomTo("");
    setSearchQuery("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Orders</h2>
          <p className="text-xs text-slate-400">
            View and update order status. Link to track for customers.
          </p>
        </div>

        <DateRangeFilter
          value={dateFilter}
          customFrom={customFrom}
          customTo={customTo}
          onChange={setDateFilter}
          onCustomChange={(from, to) => {
            setCustomFrom(from);
            setCustomTo(to);
          }}
        />
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-red-900/70 bg-red-950/40 px-3 py-2">
          <p className="text-xs text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => load()}
            className="shrink-0 rounded-md border border-red-800/70 px-2.5 py-1 text-[11px] font-medium text-red-300 transition-colors hover:bg-red-900/40"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Status chips (also the status filter — replaces the old
          duplicate pill-button row that filtered by the same state) ── */}
      <section
        role="tablist"
        aria-label="Filter orders by status"
        className="flex flex-wrap gap-2"
      >
        <StatChip
          label="All orders"
          count={orderStats.totalOrders}
          isActive={filterStatus === "ALL"}
          onClick={() => setFilterStatus("ALL")}
          icon={<BagIcon />}
          dot="bg-slate-300"
          activeClass="border-slate-100/40 bg-slate-100/10 text-slate-100"
        />
        {STATUS_OPTIONS.map((status) => (
          <StatChip
            key={status}
            label={STATUS_META[status].label}
            count={orderStats.statusCounts[status]}
            isActive={filterStatus === status}
            onClick={() => setFilterStatus(status)}
            dot={STATUS_META[status].dot}
            activeClass={STATUS_META[status].chipActive}
          />
        ))}
      </section>

      <div className="flex h-[calc(100vh-320px)] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <label htmlFor="order-search" className="sr-only">
                  Search orders by ID, email, or phone
                </label>
                <input
                  id="order-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID / Email / Phone"
                  className="w-[280px] max-w-[70vw] rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-slate-600"
                />
                {searchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-200"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500" aria-live="polite">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  <span className="text-[10px] font-mono uppercase text-slate-500">
                    Live Sync
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="sticky top-0 z-10 bg-slate-900 text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Items</th>
                <th className="px-4 py-2 font-medium">Subtotal</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && orders.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-800/80">
                    <td colSpan={7} className="px-4 py-3">
                      <div
                        className="h-4 animate-pulse rounded bg-slate-800/80"
                        style={{ animationDelay: `${i * 60}ms` }}
                      />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    {orders.length === 0
                      ? "No orders yet."
                      : "No orders match the current filters."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <Fragment key={o._id}>
                    <tr className="border-t border-slate-800/80 hover:bg-slate-900/60">
                      <td className="px-4 py-2 align-middle">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm text-slate-50">
                            {o._id.slice(-8)}
                          </span>
                          {o.trackingToken ? (
                            <Link
                              href={`/order-tracking?token=${encodeURIComponent(o.trackingToken)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-400 hover:text-slate-200"
                            >
                              View tracking
                            </Link>
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 align-middle">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-2 align-middle">
                        <div>
                          <span className="text-slate-50">
                            {o.deliveryAddress?.name ?? "-"}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            {o.deliveryAddress?.city ?? ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 align-middle">{o.items?.length ?? 0} item(s)</td>
                      <td className="px-4 py-2 align-middle">
                        {formatCurrency(Number(o.subtotal ?? 0))}
                      </td>
                      <td className="px-4 py-2 align-middle">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          disabled={updatingId === o._id}
                          className={`rounded-lg border px-2 py-1 text-xs outline-none transition-colors focus:ring-1 focus:ring-slate-400 disabled:opacity-60 ${
                            STATUS_META[o.status as StatusKey]?.selectClass ??
                            "border-slate-700 bg-slate-900 text-slate-200"
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-slate-900 text-slate-200">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right align-middle">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}
                          className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-200 transition-colors hover:bg-slate-800"
                          aria-expanded={expandedId === o._id}
                        >
                          {expandedId === o._id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === o._id && (
                      <tr>
                        <td colSpan={7} className="border-t border-slate-800 bg-slate-900/40 px-4 py-3">
                          <div className="grid gap-4 text-xs md:grid-cols-2">
                            <div>
                              <p className="mb-1 font-medium text-slate-300">Delivery address</p>
                              <p className="text-slate-400">
                                {o.deliveryAddress?.name}
                                <br />
                                {o.deliveryAddress?.phone}
                                <br />
                                {o.deliveryAddress?.email}
                                <br />
                                {o.deliveryAddress?.address}
                                <br />
                                {o.deliveryAddress?.city}
                                {o.deliveryAddress?.area ? `, ${o.deliveryAddress.area}` : ""}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-medium text-slate-300">Items</p>
                              <ul className="space-y-0.5 text-slate-400">
                                {(o.items ?? []).map((item) => (
                                  <li key={String(item.productId)}>
                                    {pickLocale(item.name)} × {item.quantity} —{" "}
                                    {formatCurrency(item.price * item.quantity)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-400">
          Loading orders...
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StatChip({
  label,
  count,
  isActive,
  onClick,
  dot,
  activeClass,
  icon,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  dot: string;
  activeClass: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
        isActive
          ? activeClass
          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
      }`}
    >
      {icon ?? <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />}
      <span>{label}</span>
      <span className="tabular-nums text-slate-500">{count}</span>
    </button>
  );
}

function DateRangeFilter({
  value,
  customFrom,
  customTo,
  onChange,
  onCustomChange,
}: {
  value: DateFilterKey;
  customFrom: string;
  customTo: string;
  onChange: (key: DateFilterKey) => void;
  onCustomChange: (from: string, to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presetKeys: DateFilterKey[] = ["ALL_TIME", "TODAY", "WEEK", "MONTH", "YEAR"];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600"
      >
        <CalendarIcon />
        {DATE_FILTER_LABELS[value]}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-xl shadow-black/40">
          <ul className="space-y-0.5">
            {presetKeys.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    value === key
                      ? "bg-sky-500/10 text-sky-300"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {DATE_FILTER_LABELS[key]}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-1 border-t border-slate-800 pt-2">
            <button
              type="button"
              onClick={() => onChange("CUSTOM")}
              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                value === "CUSTOM" ? "bg-sky-500/10 text-sky-300" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Custom range
            </button>

            {value === "CUSTOM" && (
              <div className="mt-2 space-y-2 px-2.5">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
                    From
                  </label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => onCustomChange(e.target.value, customTo)}
                    max={customTo || undefined}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
                    To
                  </label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => onCustomChange(customFrom, e.target.value)}
                    min={customFrom || undefined}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-slate-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={!customFrom || !customTo}
                  className="w-full rounded-md bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Icons (inline — no extra dependency)
// ─────────────────────────────────────────────

function BagIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5Z" />
      <path d="M3 7h18M16 11a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
