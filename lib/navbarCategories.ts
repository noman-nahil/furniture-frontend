import { serverFetch, isServerFetchError } from "@/lib/serverFetch";
import type { ServerFetchError, ServerFetchResult } from "@/lib/serverFetch";
import type { CategoryNav } from "@/types/categoryNav";

/**
 * Matches homepage / category ISR: successful payloads live in the Next.js
 * Data Cache for 60s. Next only stores HTTP 200, and stale entries are served
 * while a background revalidate runs — so a 429/5xx/timeout does not replace
 * a previously successful list with [].
 */
export const NAVBAR_CATEGORIES_REVALIDATE_SECONDS = 60;

export type NavbarCategoriesSource = "ok" | "stale" | "unavailable";

export type NavbarCategoriesResolution = {
  categories: CategoryNav[];
  source: NavbarCategoriesSource;
  errorType?: ServerFetchError;
  status?: number;
};

/** Parents with showInNavbar === false stay off the menu (missing means shown). */
export function filterNavbarCategories(categories: CategoryNav[]): CategoryNav[] {
  return categories.filter((c) => c.showInNavbar !== false);
}

function failureMeta(res: {
  errorType: ServerFetchError;
  status?: number;
}): Pick<NavbarCategoriesResolution, "errorType" | "status"> {
  return {
    errorType: res.errorType,
    ...(res.status !== undefined ? { status: res.status } : {}),
  };
}

/**
 * Map a /categories/active result onto navbar props.
 *
 * A 200 + [] is a real empty catalog.
 * A fetch failure is not — reuse last-known-good when the caller has it.
 */
export function resolveNavbarCategories(
  res: ServerFetchResult<CategoryNav[]>,
  lastKnownGood: CategoryNav[] | null = null,
): NavbarCategoriesResolution {
  if (isServerFetchError(res)) {
    if (lastKnownGood) {
      return {
        categories: filterNavbarCategories(lastKnownGood),
        source: "stale",
        ...failureMeta(res),
      };
    }
    return {
      categories: [],
      source: "unavailable",
      ...failureMeta(res),
    };
  }

  if (!Array.isArray(res)) {
    if (lastKnownGood) {
      return {
        categories: filterNavbarCategories(lastKnownGood),
        source: "stale",
        errorType: "parse_error",
      };
    }
    return {
      categories: [],
      source: "unavailable",
      errorType: "parse_error",
    };
  }

  return {
    categories: filterNavbarCategories(res),
    source: "ok",
  };
}

function logNavbarCategoryOutcome(resolved: NavbarCategoriesResolution): void {
  if (resolved.source === "unavailable") {
    console.error({
      scope: "navbarCategories",
      errorType: resolved.errorType,
      status: resolved.status,
      message:
        "Category fetch failed with no cached payload; navbar will omit dynamic items",
    });
    return;
  }

  if (resolved.source === "stale") {
    console.warn({
      scope: "navbarCategories",
      errorType: resolved.errorType,
      status: resolved.status,
      message: "Serving last-known-good navbar categories after fetch failure",
    });
  }
}

/**
 * Server-only loader for the public navbar.
 * Relies on Next.js fetch Data Cache (revalidate 60, HTTP 200 only) as
 * last-known-good. Failures are never treated as a legitimate empty list.
 */
export async function getNavbarCategories(): Promise<CategoryNav[]> {
  const res = await serverFetch<CategoryNav[]>("/categories/active", {
    revalidate: NAVBAR_CATEGORIES_REVALIDATE_SECONDS,
  });
  const resolved = resolveNavbarCategories(res);
  logNavbarCategoryOutcome(resolved);
  return resolved.categories;
}
