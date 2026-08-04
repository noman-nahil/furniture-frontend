import { getImageUrl } from "@/lib/image";
import { matchesLoosely } from "@/lib/search/flexibleMatch";
import {
  SUGGEST_CATEGORY_LIMIT,
  SUGGEST_SUBCATEGORY_LIMIT,
} from "@/lib/search/normalize";
import { sortByRelevance } from "@/lib/search/ranking";
import type { SearchSuggestion } from "@/lib/search/types";
import type { CategoryNav } from "@/types/categoryNav";

export function buildCategorySuggestions(
  categories: CategoryNav[],
  query: string,
): SearchSuggestion[] {
  const cats: SearchSuggestion[] = [];
  const subs: SearchSuggestion[] = [];

  for (const cat of categories) {
    if (matchesLoosely(cat.name, query) || matchesLoosely(cat.slug, query)) {
      cats.push({
        id: `cat-${cat._id}`,
        kind: "category",
        label: cat.name,
        href: `/category/${cat.slug}`,
        image: cat.image ? getImageUrl(cat.image) : undefined,
        meta: "Category",
      });
    }
    for (const sub of cat.subcategories ?? []) {
      if (matchesLoosely(sub.name, query) || matchesLoosely(sub.slug, query)) {
        subs.push({
          id: `sub-${sub._id}`,
          kind: "subcategory",
          label: sub.name,
          href: `/category/${cat.slug}/${sub.slug}`,
          meta: cat.name,
        });
      }
    }
  }

  return [
    ...sortByRelevance(cats, query).slice(0, SUGGEST_CATEGORY_LIMIT),
    ...sortByRelevance(subs, query).slice(0, SUGGEST_SUBCATEGORY_LIMIT),
  ];
}
