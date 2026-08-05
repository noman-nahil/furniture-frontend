"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  SEARCH_DEBOUNCE_MS,
  buildSearchResultsHref,
  clampSearchInput,
  isSearchableQuery,
  normalizeSearch,
} from "@/lib/search/normalize";
import {
  shouldAutoRefineOnType,
  shouldKeepSearchQuery,
} from "@/lib/search/navigationPolicy";

/**
 * URL sync + push/replace navigation for catalog search.
 *
 * Auto-refine (debounced replace) runs only while already on /products.
 * From other pages, navigation happens on explicit commit (Enter / View all).
 */
export function useSearchNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearchPending, startSearchTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDirtyRef = useRef(false);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // URL → input sync
  // Keep query on /products results and /products/[slug] PDP.
  // Clear when leaving via category / home / other nav routes.
  useEffect(() => {
    if (!shouldKeepSearchQuery(pathname)) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      searchDirtyRef.current = false;
      setSearchQuery("");
      return;
    }

    // Product detail: keep whatever is already in the box (no ?search= on PDP).
    if (pathname.startsWith("/products/")) {
      return;
    }

    // Results page: mirror ?search=
    if (searchDirtyRef.current || searchDebounceRef.current != null) return;
    setSearchQuery(searchParams.get("search") ?? "");
  }, [searchParams, pathname]);

  const navigateToSearch = useCallback(
    (value: string) => {
      const trimmed = normalizeSearch(value);
      const onProducts = pathname === "/products";
      const currentSearch = normalizeSearch(searchParams.get("search") ?? "");

      if (!trimmed && !onProducts) {
        searchDirtyRef.current = false;
        return;
      }

      if (trimmed && !isSearchableQuery(trimmed)) {
        return;
      }

      if (onProducts && currentSearch === trimmed) {
        searchDirtyRef.current = false;
        return;
      }

      const href = buildSearchResultsHref(trimmed);
      const navigate = onProducts ? router.replace : router.push;
      const scroll = !onProducts;

      startSearchTransition(() => {
        navigate(href, { scroll });
      });

      searchDirtyRef.current = false;
    },
    [pathname, searchParams, router],
  );

  const navigateToHref = useCallback(
    (href: string) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      searchDirtyRef.current = false;
      startSearchTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  const scheduleRefineIfOnProducts = useCallback(
    (raw: string) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

      // Off /products: suggestions-only — no full RSC navigation while typing.
      if (!shouldAutoRefineOnType(pathname)) {
        searchDebounceRef.current = null;
        return;
      }

      searchDebounceRef.current = setTimeout(() => {
        searchDebounceRef.current = null;
        const normalized = normalizeSearch(raw);
        if (normalized && !isSearchableQuery(normalized)) return;
        navigateToSearch(raw);
      }, SEARCH_DEBOUNCE_MS);
    },
    [pathname, navigateToSearch],
  );

  const setQueryFromInput = useCallback((value: string) => {
    const next = clampSearchInput(value);
    searchDirtyRef.current = true;
    setSearchQuery(next);
    return next;
  }, []);

  const clearDebounce = useCallback(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
  }, []);

  const commitSearch = useCallback(
    (value: string = searchQuery) => {
      clearDebounce();
      navigateToSearch(value);
    },
    [searchQuery, clearDebounce, navigateToSearch],
  );

  const clearSearchQuery = useCallback(() => {
    clearDebounce();
    searchDirtyRef.current = true;
    setSearchQuery("");
    navigateToSearch("");
  }, [clearDebounce, navigateToSearch]);

  return {
    pathname,
    searchQuery,
    setSearchQuery,
    setQueryFromInput,
    isSearchPending,
    navigateToSearch,
    navigateToHref,
    scheduleRefineIfOnProducts,
    clearDebounce,
    commitSearch,
    clearSearchQuery,
    searchDirtyRef,
  };
}
