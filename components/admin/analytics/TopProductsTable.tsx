import type { AnalyticsTopAdded, AnalyticsTopViewed } from "@/types/adminAnalytics";

export function TopProductsTable({
  viewed,
  added,
}: {
  viewed: AnalyticsTopViewed[];
  added: AnalyticsTopAdded[];
}) {
  const rows = new Map<
    string,
    { itemId: string; itemName: string; views: number; adds: number }
  >();

  for (const item of viewed) {
    rows.set(item.itemId || item.itemName, {
      itemId: item.itemId,
      itemName: item.itemName,
      views: item.views,
      adds: 0,
    });
  }
  for (const item of added) {
    const key = item.itemId || item.itemName;
    const existing = rows.get(key);
    if (existing) {
      existing.adds = item.adds;
    } else {
      rows.set(key, {
        itemId: item.itemId,
        itemName: item.itemName,
        views: 0,
        adds: item.adds,
      });
    }
  }

  const list = [...rows.values()].sort(
    (a, b) => b.views + b.adds - (a.views + a.adds),
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-50">Top products</h3>
      {list.length === 0 ? (
        <p className="text-sm text-slate-400">
          No product view or add-to-cart events in this range.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Views</th>
                <th className="pb-2 font-medium tabular-nums">Added to cart</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.itemId || row.itemName} className="border-b border-slate-800/80 last:border-0">
                  <td className="py-2.5 pr-4 text-slate-200">{row.itemName}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-slate-300">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="py-2.5 tabular-nums text-slate-300">
                    {row.adds.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
