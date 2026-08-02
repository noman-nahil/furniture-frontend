import Link from "next/link";

type DashboardEmptyStateProps = {
  title: string;
  description: string;
  action?: { href: string; label: string };
  icon?: React.ReactNode;
};

export function DashboardEmptyState({
  title,
  description,
  action,
  icon,
}: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      {icon && (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400"
          aria-hidden
        >
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="max-w-xs text-xs text-slate-400">{description}</p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="mt-1 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
