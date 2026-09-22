import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/jsonLd";

export function PageBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Fil d’Ariane" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#A09080]">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden className="select-none">
                  ›
                </span>
              ) : null}
              {last ? (
                <span className="font-medium text-[#1A1A1A]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-[#B8935A] transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
