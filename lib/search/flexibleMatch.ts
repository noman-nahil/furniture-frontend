/**
 * Treat spaces / hyphens / underscores as interchangeable for matching.
 * "canape 7" ↔ "canape-7" ↔ "canape7"
 */

/** Strip separators for compact equality / contains checks. */
export function compactSearchKey(raw: string): string {
  return String(raw)
    .toLowerCase()
    .replace(/[\s\-_]+/g, "");
}

/** Escape a string for use inside a RegExp. */
export function escapeRegExp(raw: string): string {
  return String(raw).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a regex source where letter/digit runs may have separators between them.
 * "canape 7" | "canape-7" | "canape7" → "canape[\\s\\-_]*7"
 */
export function toFlexiblePattern(raw: string): string {
  const trimmed = String(raw).trim();
  if (!trimmed) return "";

  // Split letters and digits apart so "canape7" → ["canape","7"].
  const tokens = trimmed.match(/[a-zA-Z]+|[0-9]+/g);
  if (!tokens || tokens.length === 0) return escapeRegExp(trimmed);
  if (tokens.length === 1) return escapeRegExp(tokens[0]);

  return tokens.map(escapeRegExp).join("[\\s\\-_]*");
}

/** True if haystack matches needle with flexible separators. */
export function matchesLoosely(haystack: string, needle: string): boolean {
  const h = String(haystack ?? "");
  const n = String(needle ?? "").trim();
  if (!n) return false;
  if (h.toLowerCase().includes(n.toLowerCase())) return true;
  if (compactSearchKey(h).includes(compactSearchKey(n))) return true;
  try {
    const pattern = toFlexiblePattern(n);
    if (!pattern) return false;
    return new RegExp(pattern, "i").test(h);
  } catch {
    return false;
  }
}

/** Locate a flexible match inside label for highlighting. */
export function findFlexibleMatch(
  label: string,
  query: string,
): { start: number; length: number } | null {
  const q = String(query ?? "").trim();
  if (!q || !label) return null;

  const lowerLabel = label.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const exactIdx = lowerLabel.indexOf(lowerQuery);
  if (exactIdx !== -1) {
    return { start: exactIdx, length: q.length };
  }

  try {
    const pattern = toFlexiblePattern(q);
    if (!pattern) return null;
    const match = label.match(new RegExp(pattern, "i"));
    if (!match || match.index == null) return null;
    return { start: match.index, length: match[0].length };
  } catch {
    return null;
  }
}
