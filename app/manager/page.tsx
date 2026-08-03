import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CURRENCY } from "@/lib/config";
import { pickLocale } from "@/lib/locale";
import type { LocalizedField } from "@/types/product";

export const metadata: Metadata = {
  title: "Manager",
  description: "Meubles De Paris manager dashboard.",
  robots: { index: false, follow: false },
};

interface Order {
  _id: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  subtotal: number;
  deliveryAddress: { name: string };
  status: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: LocalizedField;
  quantity: number;
  price: number;
  status: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  statusCounts: {
    PENDING: number;
    CONFIRMED: number;
    PROCESSING: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
  recentOrders: Array<{
    _id: string;
    status: string;
    subtotal: number;
    createdAt: string;
    deliveryAddress: {
      name: string;
    };
  }>;
  inventoryInsights: {
    lowStockCount: number;
    outOfStockCount: number;
    lowStockProducts: Array<{
      name: LocalizedField;
      quantity: number;
    }>;
    outOfStockProducts: Array<{
      name: LocalizedField;
    }>;
  };
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const cookieStore = await cookies();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      statusCounts: {
        PENDING: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      },
      recentOrders: [],
      inventoryInsights: {
        lowStockCount: 0,
        outOfStockCount: 0,
        lowStockProducts: [],
        outOfStockProducts: [],
      },
    };
  }

  try {
    const headers = {
      Cookie: cookieStore.toString(),
      "Content-Type": "application/json",
    };

    console.log(headers);

    const response = await fetch(`${baseUrl}/dashboard/stats`, {
      headers,
      cache: "no-store",
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
  }

  return {
    totalRevenue: 0,
    totalOrders: 0,
    statusCounts: {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    },
    recentOrders: [],
    inventoryInsights: {
      lowStockCount: 0,
      outOfStockCount: 0,
      lowStockProducts: [],
      outOfStockProducts: [],
    },
  };
}

export default async function ManagerDashboardPage() {
  const stats = await fetchDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      PENDING: "bg-yellow-950 text-yellow-200",
      CONFIRMED: "bg-blue-950 text-blue-200",
      PROCESSING: "bg-blue-900 text-blue-100",
      SHIPPED: "bg-purple-950 text-purple-200",
      DELIVERED: "bg-green-950 text-green-200",
      CANCELLED: "bg-red-950 text-red-200",
    };
    return statusMap[status] || "bg-slate-800 text-slate-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link
          href="/manager/products"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm font-medium hover:bg-white transition-colors"
        >
          Manage products
        </Link>
        <Link
          href="/manager/orders"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-200 hover:bg-slate-900 transition-colors"
        >
          View orders
        </Link>
        <Link
          href="/manager/settings"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-200 hover:bg-slate-900 transition-colors"
        >
          Change password
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="From delivered orders"
        />
        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          subtitle="All time"
        />
        <DashboardCard
          title="Delivered"
          value={stats.statusCounts.DELIVERED.toString()}
          subtitle="Completed orders"
        />
        <DashboardCard
          title="Pending"
          value={stats.statusCounts.PENDING.toString()}
          subtitle="Awaiting confirmation"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Recent Orders
            </h2>
            {stats.recentOrders.length > 0 && (
              <Link
                href="/manager/orders"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all
              </Link>
            )}
          </div>

          {stats.recentOrders.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="text-xs border-t border-slate-700 pt-2 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-300">
                      #{order._id.slice(-8)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{order.deliveryAddress.name}</span>
                    <span className="font-medium text-slate-200">
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No orders yet.</p>
          )}
        </div>

        {/* Inventory Overview */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Inventory Overview
            </h2>
            {stats.inventoryInsights.lowStockCount > 0 || stats.inventoryInsights.outOfStockCount > 0 ? (
              <Link
                href="/manager/products"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Manage
              </Link>
            ) : null}
          </div>

          {stats.inventoryInsights.lowStockCount > 0 || stats.inventoryInsights.outOfStockCount > 0 ? (
            <div className="space-y-3">
              {/* Inventory Stats */}
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Low Stock</p>
                  <p className="text-lg font-semibold text-yellow-400">
                    {stats.inventoryInsights.lowStockCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Out of Stock</p>
                  <p className="text-lg font-semibold text-red-400">
                    {stats.inventoryInsights.outOfStockCount}
                  </p>
                </div>
              </div>

              {/* Low Stock Products */}
              {stats.inventoryInsights.lowStockProducts.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Low Stock Items:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {stats.inventoryInsights.lowStockProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300 truncate">
                          {pickLocale(product.name)}
                        </span>
                        <span className="font-medium text-yellow-400 ml-2">
                          {product.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Out of Stock Products */}
              {stats.inventoryInsights.outOfStockProducts.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Out of Stock Items:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {stats.inventoryInsights.outOfStockProducts.map((product, index) => (
                      <div
                        key={index}
                        className="text-xs text-slate-300 truncate"
                      >
                        {pickLocale(product.name)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">All products are well stocked.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function DashboardCard(props: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  const { title, value, subtitle } = props;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        {title}
      </p>
      <p className="text-2xl font-semibold text-slate-50 mb-1">{value}</p>
      {subtitle ? (
        <p className="text-xs text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

