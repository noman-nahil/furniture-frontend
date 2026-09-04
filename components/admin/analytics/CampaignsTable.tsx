import type { AnalyticsCampaignRow } from "@/types/adminAnalytics";

export function CampaignsTable({ rows }: { rows: AnalyticsCampaignRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-50">Campaigns</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-4 font-medium">Campaign</th>
              <th className="pb-2 pr-4 font-medium">Source</th>
              <th className="pb-2 pr-4 font-medium tabular-nums">Sessions</th>
              <th className="pb-2 font-medium tabular-nums">Users</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.campaign}:${row.source}`}
                className="border-b border-slate-800/80 last:border-0"
              >
                <td className="py-2.5 pr-4 text-slate-200">{row.campaign}</td>
                <td className="py-2.5 pr-4 text-slate-400">{row.source}</td>
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
    </div>
  );
}
