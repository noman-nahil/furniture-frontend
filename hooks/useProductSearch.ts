"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSearchCombobox } from "@/hooks/search/useSearchCombobox";
import { useSearchNavigation } from "@/hooks/search/useSearchNavigation";
import { useSearchSuggestions } from "@/hooks/search/useSearchSuggestions";
import {
  isSearchableQuery,
  normalizeSearch,
} from "@/lib/search/normalize";
import type { CategoryNav } from "@/types/categoryNav";
import type { ProductSearchClient, SearchSuggestion } from "@/lib/search/types";

type UseProductSearchOptions = {
  categories?: CategoryNav[];
  locale?: "fr" | "en";
  client?: ProductSearchClient;
};

/**
 * Facade over navigation + suggestions + combobox.
 * Keeps Navbar integration stable while internals stay testable.
 */
export function useProductSearch({
  categories = [],
  locale = "fr",
  client,
}: UseProductSearchOptions = {}) {
  const pathname = usePathname();
  const nav = useSearchNavigation();
  const suggest = useSearchSuggestions({ categories, locale, client });

  const {
    searchQuery,
    commitSearch,
    setSearchQuery,
    navigateToHref,
    clearSearchQuery,
    setQueryFromInput,
    scheduleRefineIfOnProducts,
    isSearchPending,
    navigateToSearch,
  } = nav;

  const {
    productSuggestions,
    getMergedSuggestions,
    scheduleSuggest,
    resetSuggestions,
    retrySuggest,
    isSuggestLoading,
    suggestError,
  } = suggest;

  const panelAllowed = isSearchableQuery(normalizeSearch(searchQuery));

  const suggestions = useMemo(
    () => getMergedSuggestions(searchQuery),
    [getMergedSuggestions, searchQuery, productSuggestions, categories],
  );

  const onCommitSearch = useCallback(() => {
    commitSearch(searchQuery);
  }, [commitSearch, searchQuery]);

  const onSelectSuggestion = useCallback(
    (item: SearchSuggestion) => {
      if (item.kind === "viewAll") {
        commitSearch(normalizeSearch(searchQuery));
        return;
      }
      setSearchQuery(item.label);
      navigateToHref(item.href);
    },
    [commitSearch, searchQuery, setSearchQuery, navigateToHref],
  );

  const onClear = useCallback(() => {
    resetSuggestions();
    clearSearchQuery();
  }, [resetSuggestions, clearSearchQuery]);

  const combobox = useSearchCombobox({
    suggestions,
    hasQuery: searchQuery.length > 0,
    panelAllowed,
    onCommitSearch,
    onSelectSuggestion,
    onClear,
  });

  const {
    closePanel,
    setActiveIndex,
    setIsOpen,
    openPanel,
    inputRef,
    handleKeyDown,
    showPanel,
    activeIndex,
    activeDescendant,
    inputId,
    listboxId,
    containerRef,
    panelRef,
  } = combobox;

  useEffect(() => {
    closePanel();
  }, [pathname, closePanel]);

  const handleInputChange = useCallback(
    (value: string) => {
      const next = setQueryFromInput(value);
      setActiveIndex(-1);
      setIsOpen(true);
      scheduleRefineIfOnProducts(next);
      scheduleSuggest(next);
    },
    [
      setQueryFromInput,
      setActiveIndex,
      setIsOpen,
      scheduleRefineIfOnProducts,
      scheduleSuggest,
    ],
  );

  const handleFocus = useCallback(() => {
    if (!isSearchableQuery(normalizeSearch(searchQuery))) return;
    openPanel();
    scheduleSuggest(searchQuery);
  }, [searchQuery, openPanel, scheduleSuggest]);

  const clearSearch = useCallback(() => {
    resetSuggestions();
    clearSearchQuery();
    closePanel();
    inputRef.current?.focus();
  }, [resetSuggestions, clearSearchQuery, closePanel, inputRef]);

  const selectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      onSelectSuggestion(suggestion);
      closePanel();
    },
    [onSelectSuggestion, closePanel],
  );

  const statusMessage = useMemo(() => {
    if (!showPanel) return "";
    if (isSuggestLoading) return "Loading suggestions";
    if (suggestError) return suggestError.message;
    const count = suggestions.filter((s) => s.kind !== "viewAll").length;
    if (count === 0) return "No suggestions found";
    return `${count} suggestion${count === 1 ? "" : "s"} available`;
  }, [showPanel, isSuggestLoading, suggestError, suggestions]);

  return {
    inputId,
    listboxId,
    containerRef,
    panelRef,
    inputRef,
    searchQuery,
    isSearchPending,
    isSuggestLoading,
    suggestError,
    suggestions,
    activeIndex,
    setActiveIndex,
    showPanel,
    activeDescendant,
    statusMessage,
    handleInputChange,
    handleKeyDown,
    handleFocus,
    clearSearch,
    closePanel,
    selectSuggestion,
    navigateToSearch,
    commitSearch,
    retrySuggest: () => retrySuggest(searchQuery),
  };
}

export type ProductSearchController = ReturnType<typeof useProductSearch>;
