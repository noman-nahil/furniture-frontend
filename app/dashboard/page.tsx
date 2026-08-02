"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/authClient";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatTrackingReference } from "@/lib/order";

type Order = {
  _id: string;
  trackingToken?: string;
  status: string;
  items?: Array<unknown>;
  subtotal?: number;
  createdAt?: string;
  deliveryAddress?: unknown;
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-800 border border-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border border-red-200",
};

function getStatusClass(status?: string) {
  if (!status) return "bg-gray-100 text-gray-700 border border-gray-200";
  return statusStyles[status.toUpperCase()] ??
    "bg-gray-100 text-gray-700 border border-gray-200";
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiFetch<{ data?: Order[] }>("/orders/my-orders");
        setOrders(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load orders. Please try again.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Hi {user?.name || "there"} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Welcome back! Track your orders, manage your account and explore your
          activity here.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/order-tracking"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Track Orders
        </Link>

        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Continue Shopping
        </Link>

        <Link
          href="/account"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Account Settings
        </Link>
      </div>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Total Orders" value={String(totalOrders)} subtitle="All time" />
        <DashboardCard title="Pending Orders" value={String(pendingOrders)} subtitle="Processing" />
        <DashboardCard title="Delivered" value={String(deliveredOrders)} subtitle="Completed" />
        <DashboardCard title="Wishlist" value="0" subtitle="Saved items" />
      </section>

      {/* Sections */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-xs text-gray-500">
                Track the latest orders and their current status.
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {totalOrders} order{totalOrders === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
              Loading orders...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm font-medium text-gray-900">You have no orders yet</p>
              <Link
                href="/"
                className="inline-flex justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-6 max-h-[50vh] overflow-y-auto space-y-4 pr-1 scroll-smooth">
              {orders.map((order) => (
                <Link
                  href={
                    order.trackingToken
                      ? `/order-tracking?token=${encodeURIComponent(order.trackingToken)}`
                      : "/order-tracking"
                  }
                  key={order._id}
                  className="block rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-blue-300 hover:bg-white"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Order reference</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">
                        {order.trackingToken
                          ? formatTrackingReference(order.trackingToken)
                          : order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(order.status)}`}>
                      {order.status || "Unknown"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.subtotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Items</p>
                      <p className="text-sm font-semibold text-gray-900">{order.items?.length ?? 0}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Account Overview</h2>
          <p className="text-xs text-gray-500">
            Manage your personal details, address and preferences.
          </p>
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {title}
      </p>
      <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}