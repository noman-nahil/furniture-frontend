import Link from "next/link";
import type { LocalizedField } from "@/types/product";
import { pickLocale } from "@/lib/locale";
import { DashboardEmptyState } from "./DashboardEmptyState";

type InventoryProduct = {
  productId: string;
  name: LocalizedField;
  quantity?: number;
};

type InventoryOverviewProps = {
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: InventoryProduct[];
  outOfStockProducts: InventoryProduct[];
};

export function InventoryOverview({
  lowStockCount,
  outOfStockCount,
  lowStockProducts,
  outOfStockProducts,
}: InventoryOverviewProps) {
  const hasStockIssues = lowStockCount > 0 || outOfStockCount > 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="inventory-heading" className="text-sm font-semibold text-slate-100">
          Inventory Overview
        </h2>
        <Link
          href="/admin/products"
          className="text-xs font-medium text-sky-400 transition-colors hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          {hasStockIssues ? "Manage →" : "View products"}
        </Link>
      </div>

      {hasStockIssues ? (
        <div className="space-y-4" aria-labelledby="inventory-heading">
          <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-4">
            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 rounded-lg bg-amber-500/5 p-2.5 transition-colors hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500/50"
              aria-label={`${lowStockCount} low stock products — manage inventory`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <AlertIcon />
              </div>
              <div>
                <p className="text-xs text-slate-400">Low Stock</p>
                <p className="text-base font-semibold tabular-nums text-amber-400">
                  {lowStockCount}
                </p>
              </div>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 rounded-lg bg-rose-500/5 p-2.5 transition-colors hover:bg-rose-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500/50"
              aria-label={`${outOfStockCount} out of stock products — manage inventory`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <XCircleIcon />
              </div>
              <div>
                <p className="text-xs text-slate-400">Out of Stock</p>
                <p className="text-base font-semibold tabular-nums text-rose-400">
                  {outOfStockCount}
                </p>
              </div>
            </Link>
          </div>

          {lowStockProducts.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-400">Low Stock Items</p>
              <ul className="max-h-32 space-y-0.5 overflow-y-auto">
                {lowStockProducts.map((product) => (
                  <li key={product.productId}>
                    <Link
                      href={`/admin/products?edit=${product.productId}`}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-slate-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                    >
                      <span className="truncate text-slate-300">
                        {pickLocale(product.name)}
                      </span>
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 font-medium tabular-nums text-amber-400">
                        {product.quantity} left
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {outOfStockProducts.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-400">Out of Stock Items</p>
              <ul className="max-h-32 space-y-0.5 overflow-y-auto">
                {outOfStockProducts.map((product) => (
                  <li key={product.productId}>
                    <Link
                      href={`/admin/products?edit=${product.productId}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-slate-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden />
                      <span className="truncate text-slate-300">
                        {pickLocale(product.name)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <DashboardEmptyState
          title="All products are well stocked"
          description="Inventory levels look healthy. Check back here if stock runs low."
          action={{ href: "/admin/products", label: "View products" }}
          icon={<CheckIcon />}
        />
      )}
    </div>
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

function AlertIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}
