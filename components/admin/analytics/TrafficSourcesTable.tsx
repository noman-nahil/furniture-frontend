import type { AnalyticsSourceRow } from "@/types/adminAnalytics";

export function TrafficSourcesTable({ rows }: { rows: AnalyticsSourceRow[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-50">Traffic sources</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">No traffic sources in this range.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4 font-medium">Source</th>
                <th className="pb-2 pr-4 font-medium">Medium</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">Sessions</th>
                <th className="pb-2 font-medium tabular-nums">Users</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.source}:${row.medium}`}
                  className="border-b border-slate-800/80 last:border-0"
                >
                  <td className="py-2.5 pr-4 text-slate-200">{row.source}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{row.medium}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-slate-300">
                    {row.sessions.toLocaleString()}
                  </td>
                  <td className="py-2.5 tabular-nums text-slate-300">
                    {row.users.toLocaleString()}
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
