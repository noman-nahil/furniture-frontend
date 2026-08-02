"use client";

type SubcategoryFormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SubcategoryFormSection({ title, description, children }: SubcategoryFormSectionProps) {
  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/25 p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-100">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
