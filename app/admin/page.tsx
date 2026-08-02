import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CURRENCY_CODE, LOCALE } from "@/lib/config";
import { MonthlyOrdersContainer } from "@/components/dashboard/MonthlyOrdersContainer";
import { MonthlyRevenueContainer } from "@/components/dashboard/MonthlyRevenueContainer";
import { AttentionBanner } from "@/components/dashboard/AttentionBanner";
import { RecentOrdersWidget } from "@/components/dashboard/RecentOrdersWidget";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { StatusBreakdown } from "@/components/dashboard/StatusBreakdown";
import { InventoryOverview } from "@/components/dashboard/InventoryOverview";
import { TodayMetrics, type PeriodMetrics } from "@/components/dashboard/TodayMetrics";
import {
  ActivityFeedWidget,
  type ActivityEvent,
} from "@/components/dashboard/ActivityFeedWidget";
import { ChartRangeSelector } from "@/components/dashboard/ChartRangeSelector";
import { parseChartRange } from "@/lib/chartRange";
import type { LocalizedField } from "@/types/product";

export const metadata: Metadata = {
  title: "Admin — Overview",
  description: "Meubles De Paris admin overview and quick links.",
  openGraph: {
    title: "Admin — Overview",
    description: "Meubles De Paris admin overview and quick links.",
  },
  robots: { index: false, follow: false },
};

interface StatusCounts {
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
}

interface InventoryInsights {
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: Array<{ productId: string; name: LocalizedField; quantity: number }>;
  outOfStockProducts: Array<{ productId: string; name: LocalizedField }>;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  statusCounts: StatusCounts;
  recentOrders: Array<{
    _id: string;
    status: string;
    subtotal: number;
    createdAt: string;
    deliveryAddress: { name: string };
  }>;
  periodMetrics: PeriodMetrics;
  activityFeed: ActivityEvent[];
  inventoryInsights: InventoryInsights;
}

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
});

const EMPTY_PERIOD: PeriodMetrics = {
  today: { orders: 0, revenue: 0, deliveredRevenue: 0, deliveredOrders: 0 },
  yesterday: { orders: 0, revenue: 0, deliveredRevenue: 0, deliveredOrders: 0 },
};

const EMPTY_STATS: DashboardStats = {
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
  periodMetrics: EMPTY_PERIOD,
  activityFeed: [],
  inventoryInsights: {
    lowStockCount: 0,
    outOfStockCount: 0,
    lowStockProducts: [],
    outOfStockProducts: [],
  },
};

function parsePeriodSnapshot(raw: unknown) {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    orders: typeof data.orders === "number" ? data.orders : 0,
    revenue: typeof data.revenue === "number" ? data.revenue : 0,
    deliveredRevenue: typeof data.deliveredRevenue === "number" ? data.deliveredRevenue : 0,
    deliveredOrders: typeof data.deliveredOrders === "number" ? data.deliveredOrders : 0,
  };
}

function parseActivityFeed(raw: unknown): ActivityEvent[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter((item): item is ActivityEvent => {
    if (!item || typeof item !== "object") return false;
    const e = item as ActivityEvent;
    return (
      (e.type === "order_created" || e.type === "status_changed") &&
      typeof e.orderId === "string" &&
      typeof e.status === "string" &&
      typeof e.at === "string"
    );
  });
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    console.warn("[AdminOverviewPage] BACKEND_URL is not set — returning empty stats");
    return EMPTY_STATS;
  }

  try {
    const cookieStore = await cookies();

    const response = await fetch(`${baseUrl}/dashboard/stats`, {
      headers: {
        Cookie: cookieStore.toString(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `[AdminOverviewPage] /dashboard/stats returned ${response.status} ${response.statusText}`,
      );
      return EMPTY_STATS;
    }

    const data = await response.json();
    const periodRaw = data.periodMetrics;

    return {
      totalRevenue: data.totalRevenue ?? 0,
      totalOrders: data.totalOrders ?? 0,
      statusCounts: {
        PENDING: data.statusCounts?.PENDING ?? 0,
        CONFIRMED: data.statusCounts?.CONFIRMED ?? 0,
        PROCESSING: data.statusCounts?.PROCESSING ?? 0,
        SHIPPED: data.statusCounts?.SHIPPED ?? 0,
        DELIVERED: data.statusCounts?.DELIVERED ?? 0,
        CANCELLED: data.statusCounts?.CANCELLED ?? 0,
      },
      inventoryInsights: {
        lowStockCount: data.inventoryInsights?.lowStockCount ?? 0,
        outOfStockCount: data.inventoryInsights?.outOfStockCount ?? 0,
        lowStockProducts: data.inventoryInsights?.lowStockProducts ?? [],
        outOfStockProducts: data.inventoryInsights?.outOfStockProducts ?? [],
      },
      recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
      periodMetrics: {
        today: parsePeriodSnapshot(periodRaw?.today),
        yesterday: parsePeriodSnapshot(periodRaw?.yesterday),
      },
      activityFeed: parseActivityFeed(data.activityFeed),
    };
  } catch (error) {
    console.error("[AdminOverviewPage] Failed to fetch dashboard stats:", error);
    return EMPTY_STATS;
  }
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ charts?: string }>;
}) {
  const params = await searchParams;
  const chartRange = parseChartRange(params.charts);
  const stats = await fetchDashboardStats();
  const { inventoryInsights: inv } = stats;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Overview</h1>
        <p className="mt-1 text-sm text-slate-400">Store performance at a glance.</p>
      </header>

      <AttentionBanner
        pendingCount={stats.statusCounts.PENDING}
        lowStockCount={inv.lowStockCount}
        outOfStockCount={inv.outOfStockCount}
      />

      <TodayMetrics metrics={stats.periodMetrics} />

      <section aria-label="All-time key metrics" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          href="/admin/orders?status=DELIVERED"
          title="Total Revenue"
          value={currencyFormatter.format(stats.totalRevenue)}
          subtitle="Delivered orders"
          accent="emerald"
          icon={<WalletIcon />}
        />
        <DashboardCard
          href="/admin/orders"
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          subtitle="All time"
          accent="sky"
          icon={<BagIcon />}
        />
        <DashboardCard
          href="/admin/orders?status=DELIVERED"
          title="Delivered"
          value={stats.statusCounts.DELIVERED.toLocaleString()}
          subtitle="Completed orders"
          accent="emerald"
          icon={<CheckIcon />}
        />
        <DashboardCard
          href="/admin/orders?status=PENDING"
          title="Pending"
          value={stats.statusCounts.PENDING.toLocaleString()}
          subtitle="Awaiting confirmation"
          accent="amber"
          icon={<ClockIcon />}
        />
      </section>

      <section
        aria-label="Recent activity and shortcuts"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-1">
          <RecentOrdersWidget orders={stats.recentOrders} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeedWidget events={stats.activityFeed} />
        </div>
        <div className="lg:col-span-1">
          <QuickActionsPanel />
        </div>
      </section>

      <section aria-label="Analytics charts" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-100">Analytics</h2>
          <Suspense fallback={null}>
            <ChartRangeSelector />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="order-1 lg:col-span-7">
            <MonthlyRevenueContainer chartRange={chartRange} />
          </div>
          <div className="order-2 lg:col-span-5">
            <MonthlyOrdersContainer chartRange={chartRange} />
          </div>
        </div>
      </section>

      <section
        aria-label="Orders pipeline and inventory"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <StatusBreakdown statusCounts={stats.statusCounts} total={stats.totalOrders} />
        <InventoryOverview
          lowStockCount={inv.lowStockCount}
          outOfStockCount={inv.outOfStockCount}
          lowStockProducts={inv.lowStockProducts}
          outOfStockProducts={inv.outOfStockProducts}
        />
      </section>
    </div>
  );
}
type Accent = "sky" | "emerald" | "amber" | "rose";

const ACCENT_STYLES: Record<Accent, { iconBg: string; iconText: string; glow: string }> = {
  sky: { iconBg: "bg-sky-500/10", iconText: "text-sky-400", glow: "from-sky-500/20" },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-400",
    glow: "from-emerald-500/20",
  },
  amber: { iconBg: "bg-amber-500/10", iconText: "text-amber-400", glow: "from-amber-500/20" },
  rose: { iconBg: "bg-rose-500/10", iconText: "text-rose-400", glow: "from-rose-500/20" },
};

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  accent = "sky",
  href,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: Accent;
  href: string;
}) {
  const a = ACCENT_STYLES[accent];

  return (
    <Link
      href={href}
      aria-label={`${title}: ${value}${subtitle ? ` — ${subtitle}` : ""}`}
      className="group relative block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${a.glow} to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1.5 truncate text-xs font-medium uppercase tracking-wide text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-semibold tabular-nums text-slate-50">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.iconBg} ${a.iconText}`}
        >
          {icon}
        </div>
      </div>
    </Link>
  );
}

function WalletIcon() {
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
      <path d="M21 12V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4Z" />
      <path d="M21 12h-4a2 2 0 0 0 0 4h4" />
    </svg>
  );
}

function BagIcon() {
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

function CheckIcon() {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function ClockIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

