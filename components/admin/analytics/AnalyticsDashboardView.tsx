import { Suspense } from "react";
import { CURRENCY_CODE, LOCALE } from "@/lib/config";
import { AnalyticsMetricCard } from "./AnalyticsMetricCard";
import {
  Ga4ConnectBanner,
  Ga4ConnectedBar,
  Ga4OAuthFlash,
  SalesUnavailableBanner,
} from "./Ga4UnavailableBanner";
import { SalesByDayChart } from "./SalesByDayChart";
import { TrafficChannelChart } from "./TrafficChannelChart";
import { TopProductsTable } from "./TopProductsTable";
import { TrafficSourcesTable } from "./TrafficSourcesTable";
import { CampaignsTable } from "./CampaignsTable";
import { DimensionTable } from "./DimensionTable";
import type { AnalyticsDashboardResponse } from "@/types/adminAnalytics";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes}m ${String(remainder).padStart(2, "0")}s`;
}

function formatRangeLabel(from: string, to: string, timezone: string): string {
  if (from === to) return `${from} · ${timezone}`;
  return `${from} → ${to} · ${timezone}`;
}

export function AnalyticsDashboardView({
  data,
}: {
  data: AnalyticsDashboardResponse;
}) {
  const { range, ga4, sales } = data;
  const showGa4 = ga4.available;

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">
        {formatRangeLabel(range.from, range.to, range.timezone)}
      </p>

      <Suspense fallback={null}>
        <Ga4OAuthFlash />
      </Suspense>

      {showGa4 ? (
        <Ga4ConnectedBar propertyId={ga4.propertyId} />
      ) : (
        <Suspense fallback={null}>
          <Ga4ConnectBanner
            needsConnect={ga4.needsConnect}
            connected={ga4.connected}
            status={ga4.status}
            error={ga4.error}
          />
        </Suspense>
      )}

      {sales.available ? null : (
        <SalesUnavailableBanner
          message={sales.error || "Completed orders and revenue could not be loaded."}
        />
      )}

      {showGa4 && ga4.realtime?.available && ga4.realtime.activeUsers != null ? (
        <section aria-label="Realtime">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">Realtime</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsMetricCard
              title="Active users"
              value={ga4.realtime.activeUsers.toLocaleString()}
              subtitle="Last 30 minutes (GA4 realtime)"
            />
          </div>
        </section>
      ) : null}

      {showGa4 ? (
        <section aria-label="Website overview">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsMetricCard
              title="Total users"
              value={ga4.overview.users.toLocaleString()}
              subtitle={`${ga4.overview.newUsers.toLocaleString()} new users`}
            />
            <AnalyticsMetricCard
              title="Active users"
              value={ga4.overview.activeUsers.toLocaleString()}
              subtitle="In selected range"
            />
            <AnalyticsMetricCard
              title="Sessions"
              value={ga4.overview.sessions.toLocaleString()}
              subtitle={`${formatDuration(ga4.overview.averageSessionDuration)} avg session`}
            />
            <AnalyticsMetricCard
              title="Page views"
              value={ga4.overview.pageViews.toLocaleString()}
              subtitle={`${formatPercent(ga4.overview.engagementRate)} engagement`}
            />
          </div>
        </section>
      ) : null}

      <section aria-label="Sales from orders">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">Sales</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AnalyticsMetricCard
            title="Total orders"
            value={sales.available ? sales.totalOrders.toLocaleString() : "—"}
            subtitle="All statuses"
            accent="sky"
            muted={!sales.available}
          />
          <AnalyticsMetricCard
            title="Completed"
            value={sales.available ? sales.completedOrders.toLocaleString() : "—"}
            subtitle="Delivered orders"
            accent="emerald"
            muted={!sales.available}
          />
          <AnalyticsMetricCard
            title="Revenue"
            value={sales.available ? currency.format(sales.revenue) : "—"}
            subtitle="Delivered orders only"
            accent="emerald"
            muted={!sales.available}
          />
          <AnalyticsMetricCard
            title="Average order value"
            value={sales.available ? currency.format(sales.averageOrderValue) : "—"}
            subtitle={
              sales.available
                ? `${sales.cancelledOrders.toLocaleString()} cancelled`
                : "Delivered orders"
            }
            accent="amber"
            muted={!sales.available}
          />
        </div>
      </section>

      {showGa4 ? (
        <section aria-label="Product performance">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">
            Product performance
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsMetricCard
              title="Product views"
              value={ga4.products.viewItem.toLocaleString()}
              subtitle="view_item"
            />
            <AnalyticsMetricCard
              title="Add to cart"
              value={ga4.products.addToCart.toLocaleString()}
              subtitle="add_to_cart"
            />
            <AnalyticsMetricCard
              title="Checkout started"
              value={ga4.products.beginCheckout.toLocaleString()}
              subtitle="begin_checkout"
            />
            <AnalyticsMetricCard
              title="Purchases / search"
              value={`${ga4.overview.purchaseEvents.toLocaleString()} / ${ga4.products.search.toLocaleString()}`}
              subtitle={`${formatPercent(ga4.overview.checkoutConversionRate)} checkout conversion`}
            />
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {showGa4 ? (
          <div className="lg:col-span-5">
            <TrafficChannelChart data={ga4.traffic.byChannel} />
          </div>
        ) : null}
        <div className={showGa4 ? "lg:col-span-7" : "lg:col-span-12"}>
          <SalesByDayChart data={sales.available ? sales.byDay : []} />
        </div>
      </section>

      {showGa4 ? (
        <>
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopProductsTable
              viewed={ga4.products.topViewed}
              added={ga4.products.topAddedToCart}
            />
            <TrafficSourcesTable rows={ga4.traffic.bySourceMedium} />
          </section>
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DimensionTable
              title="Countries"
              nameHeader="Country"
              emptyLabel="No country data in this range."
              rows={ga4.traffic.byCountry.map((row) => ({
                name: row.country,
                sessions: row.sessions,
                users: row.users,
              }))}
            />
            <DimensionTable
              title="Devices"
              nameHeader="Device"
              emptyLabel="No device data in this range."
              rows={ga4.traffic.byDevice.map((row) => ({
                name: row.device,
                sessions: row.sessions,
                users: row.users,
              }))}
            />
            <DimensionTable
              title="Top pages"
              nameHeader="Page"
              emptyLabel="No page views in this range."
              rows={ga4.traffic.topPages.map((row) => ({
                name: row.pagePath,
                sessions: row.sessions,
                pageViews: row.pageViews,
              }))}
            />
          </section>
          <CampaignsTable rows={ga4.campaigns} />
        </>
      ) : null}
    </div>
  );
}
