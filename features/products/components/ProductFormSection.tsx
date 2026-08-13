"use client";

type ProductFormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

export function ProductFormSection({
  title,
  description,
  children,
  className,
  actions,
}: ProductFormSectionProps) {
  return (
    <section
      className={["rounded-lg border border-slate-800/80 bg-slate-900/20 p-3 sm:p-3.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={["flex items-start justify-between gap-3", description ? "mb-2.5" : "mb-2"].join(" ")}>
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-slate-100">{title}</h3>
          {description && <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{description}</p>}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
