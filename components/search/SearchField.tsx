"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/react";
import { Loader2, Search, X } from "lucide-react";
import { MAX_SEARCH_LENGTH, normalizeSearch } from "@/lib/search/normalize";
import type { ProductSearchController } from "@/hooks/useProductSearch";

const SearchSuggestions = dynamic(
  () =>
    import("./SearchSuggestions").then((m) => m.SearchSuggestions),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-500 shadow-lg">
        Loading…
      </div>
    ),
  },
);

export const SEARCH_FIELD_INPUT_CLASS =
  "w-full h-10 pl-10 pr-10 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700/40 transition-all shadow-sm";

type SearchFieldProps = {
  search: ProductSearchController;
  /** When false, renders a non-interactive visual twin (avoids dual a11y trees). */
  active?: boolean;
  className?: string;
  placeholder?: string;
};

export default function SearchField({
  search,
  active = true,
  className = SEARCH_FIELD_INPUT_CLASS,
  placeholder = "Search furniture, rooms, brands…",
}: SearchFieldProps) {
  const [mounted, setMounted] = useState(false);

  const {
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
    selectSuggestion,
    retrySuggest,
  } = search;

  const { refs, floatingStyles } = useFloating({
    open: showPanel,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${Math.max(rects.reference.width, 280)}px`,
          });
        },
      }),
    ],
  });

  useEffect(() => setMounted(true), []);

  // Keep floating-ui reference synced with the visible input wrapper.
  useEffect(() => {
    if (!active || !containerRef.current) return;
    refs.setReference(containerRef.current);
  }, [active, containerRef, refs]);

  if (!active) {
    return (
      <div className="relative w-full" aria-hidden>
        <input
          type="search"
          tabIndex={-1}
          readOnly
          disabled
          placeholder={placeholder}
          value={searchQuery}
          className={`${className} pointer-events-none [&::-webkit-search-cancel-button]:hidden`}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <Search className="h-4 w-4" />
        </span>
      </div>
    );
  }

  const setFloatingRef = (node: HTMLDivElement | null) => {
    refs.setFloating(node);
    panelRef.current = node;
  };

  const panel =
    showPanel && mounted
      ? createPortal(
          <div
            ref={setFloatingRef}
            style={{ ...floatingStyles, zIndex: 80 }}
            className="outline-none"
          >
            <SearchSuggestions
              id={listboxId}
              query={normalizeSearch(searchQuery)}
              suggestions={suggestions}
              activeIndex={activeIndex}
              isLoading={isSuggestLoading}
              error={suggestError}
              onHover={setActiveIndex}
              onSelect={selectSuggestion}
              onRetry={retrySuggest}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className="relative w-full">
      <div role="search" className="relative w-full">
        <label htmlFor={inputId} className="sr-only">
          Search products
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          maxLength={MAX_SEARCH_LENGTH}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          className={`${className} [&::-webkit-search-cancel-button]:hidden`}
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-busy={isSearchPending || isSuggestLoading || undefined}
          aria-haspopup="listbox"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {isSearchPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-700" aria-hidden />
          ) : (
            <Search className="h-4 w-4" aria-hidden />
          )}
        </span>
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {panel}
    </div>
  );
}
