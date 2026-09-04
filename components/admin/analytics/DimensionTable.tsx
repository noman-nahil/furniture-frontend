export function DimensionTable({
  title,
  nameHeader,
  rows,
  emptyLabel,
}: {
  title: string;
  nameHeader: string;
  rows: Array<{ name: string; sessions: number; users?: number; pageViews?: number }>;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-50">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4 font-medium">{nameHeader}</th>
                <th className="pb-2 pr-4 font-medium tabular-nums">
                  {rows[0]?.pageViews != null ? "Page views" : "Sessions"}
                </th>
                <th className="pb-2 font-medium tabular-nums">
                  {rows[0]?.pageViews != null ? "Sessions" : "Users"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-slate-800/80 last:border-0"
                >
                  <td className="py-2.5 pr-4 text-slate-200">{row.name}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-slate-300">
                    {(row.pageViews ?? row.sessions).toLocaleString()}
                  </td>
                  <td className="py-2.5 tabular-nums text-slate-300">
                    {(row.pageViews != null ? row.sessions : row.users ?? 0).toLocaleString()}
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
