"use client";

import { useEffect, useState, Fragment } from "react";
import { apiFetch } from "@/lib/authClient";
import { formatCurrency } from "@/lib/formatCurrency";
import Link from "next/link";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slug?: string;
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

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

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

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch<OrderListResponse>("/orders");
        if (!cancelled) {
          setOrders(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load orders.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStatusChange(orderId: string, status: string) {
    try {
      setUpdatingId(orderId);
      const updated = await apiFetch<Order>(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">Orders</h2>
        <p className="text-xs text-slate-400">
          View and update order status. Link to track for customers.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/70 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            All orders
          </p>
          {loading && (
            <p className="text-xs text-slate-500">Loading…</p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Items</th>
                <th className="px-4 py-2 font-medium">Subtotal</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <Fragment key={o._id}>
                    <tr
                      className="border-t border-slate-800/80 hover:bg-slate-900/60"
                    >
                      <td className="px-4 py-2 align-middle">
                        <div className="flex flex-col">
                          <span className="text-sm font-mono text-slate-50">
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
                      <td className="px-4 py-2 align-middle whitespace-nowrap">
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
                      <td className="px-4 py-2 align-middle">
                        {o.items?.length ?? 0} item(s)
                      </td>
                      <td className="px-4 py-2 align-middle">
                        {formatCurrency(Number(o.subtotal ?? 0))}
                      </td>
                      <td className="px-4 py-2 align-middle">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(o._id, e.target.value)
                          }
                          disabled={updatingId === o._id}
                          className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 align-middle text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expandedId === o._id ? null : o._id)
                          }
                          className="px-2 py-1 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800"
                        >
                          {expandedId === o._id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === o._id && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-3 bg-slate-900/40 border-t border-slate-800"
                        >
                          <div className="grid gap-4 md:grid-cols-2 text-xs">
                            <div>
                              <p className="font-medium text-slate-300 mb-1">
                                Delivery address
                              </p>
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
                                {o.deliveryAddress?.area
                                  ? `, ${o.deliveryAddress.area}`
                                  : ""}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-slate-300 mb-1">
                                Items
                              </p>
                              <ul className="space-y-0.5 text-slate-400">
                                {(o.items ?? []).map((item, i) => (
                                  <li key={i}>
                                    {item.name} × {item.quantity} — $
                                    {(item.price * item.quantity).toFixed(2)}
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
