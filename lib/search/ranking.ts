import {
  compactSearchKey,
  findFlexibleMatch,
  matchesLoosely,
} from "@/lib/search/flexibleMatch";

export type MatchTier =
  | "exact"
  | "sku"
  | "startsWith"
  | "partial"
  | "category"
  | "other";

export type RankableSuggestion = {
  kind: "product" | "category" | "subcategory" | "viewAll";
  label: string;
  /** Optional SKU-like identifiers (mpn / gtin). */
  skuHints?: string[];
  meta?: string;
};

/**
 * Score a suggestion for client-side ordering.
 * Higher is better. Separator-insensitive ("canape 7" ≈ "canape-7").
 */
export function scoreSuggestion(
  item: RankableSuggestion,
  rawQuery: string,
): number {
  const q = rawQuery.trim();
  if (!q) return 0;

  const qCompact = compactSearchKey(q);
  const label = item.label;
  const labelCompact = compactSearchKey(label);
  const kindBoost =
    item.kind === "product" ? 20 : item.kind === "category" ? 12 : 10;

  for (const sku of item.skuHints ?? []) {
    if (compactSearchKey(sku) === qCompact) return 1000 + kindBoost;
  }

  if (labelCompact === qCompact) return 900 + kindBoost;
  if (labelCompact.startsWith(qCompact)) return 700 + kindBoost;
  if (matchesLoosely(label, q)) return 500 + kindBoost;

  if (item.meta && matchesLoosely(item.meta, q)) return 300 + kindBoost;
  return kindBoost;
}

export function sortByRelevance<T extends RankableSuggestion>(
  items: T[],
  query: string,
): T[] {
  return [...items].sort(
    (a, b) => scoreSuggestion(b, query) - scoreSuggestion(a, query),
  );
}

/** Split label into segments for match highlighting (flexible separators). */
export function splitHighlight(
  label: string,
  query: string,
): { text: string; match: boolean }[] {
  const found = findFlexibleMatch(label, query);
  if (!found) return [{ text: label, match: false }];

  const { start, length } = found;
  const parts: { text: string; match: boolean }[] = [];
  if (start > 0) parts.push({ text: label.slice(0, start), match: false });
  parts.push({ text: label.slice(start, start + length), match: true });
  if (start + length < label.length) {
    parts.push({ text: label.slice(start + length), match: false });
  }
  return parts;
}
