"use client";

import { memo, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Folder, Layers } from "lucide-react";
import { MatchHighlight } from "./MatchHighlight";
import { SearchEmpty } from "./SearchEmpty";
import { SearchError } from "./SearchError";
import { SearchLoading } from "./SearchLoading";
import type { SearchSuggestion, SuggestErrorKind } from "./types";

type SearchSuggestionsProps = {
  id: string;
  query: string;
  suggestions: SearchSuggestion[];
  activeIndex: number;
  isLoading: boolean;
  error: { kind: SuggestErrorKind; message: string } | null;
  onHover: (index: number) => void;
  onSelect: (suggestion: SearchSuggestion) => void;
  onRetry: () => void;
};

function isRemoteImage(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function SuggestionIcon({ kind }: { kind: SearchSuggestion["kind"] }) {
  if (kind === "category") {
    return <Folder className="h-4 w-4 text-teal-700" aria-hidden />;
  }
  return <Layers className="h-4 w-4 text-teal-700" aria-hidden />;
}

function headingFor(kind: SearchSuggestion["kind"]): string | null {
  if (kind === "product") return "Products";
  if (kind === "category") return "Categories";
  if (kind === "subcategory") return "Subcategories";
  return null;
}

function SearchSuggestionsComponent({
  id,
  query,
  suggestions,
  activeIndex,
  isLoading,
  error,
  onHover,
  onSelect,
  onRetry,
}: SearchSuggestionsProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeIndex < 0) return;
    const root = listRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[role="option"][aria-selected="true"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const contentItems = suggestions.filter((s) => s.kind !== "viewAll");
  const viewAll = suggestions.find((s) => s.kind === "viewAll");
  const showEmpty = !isLoading && !error && contentItems.length === 0;

  return (
    <div
      ref={listRef}
      id={id}
      role="listbox"
      aria-label="Search suggestions"
      className="max-h-[min(28rem,70vh)] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200/90 bg-white py-1 shadow-lg ring-1 ring-black/5"
    >
      {isLoading && contentItems.length === 0 && <SearchLoading />}

      {error && (
        <SearchError
          kind={error.kind}
          message={error.message}
          onRetry={onRetry}
        />
      )}

      {showEmpty && <SearchEmpty query={query} />}

      {isLoading && contentItems.length > 0 && (
        <div className="border-b border-gray-100 px-3 py-1.5 text-xs text-gray-400">
          Updating…
        </div>
      )}

      {contentItems.map((item) => {
        const index = suggestions.indexOf(item);
        const selected = index === activeIndex;
        const prev = contentItems[contentItems.indexOf(item) - 1];
        const showHeading = !prev || prev.kind !== item.kind;
        const heading = headingFor(item.kind);

        return (
          <div key={item.id}>
            {showHeading && heading && (
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {heading}
              </div>
            )}
            <button
              type="button"
              id={item.id}
              role="option"
              aria-selected={selected}
              onMouseEnter={() => onHover(index)}
              onMouseDown={(e) => {
                // Select on mousedown so portaled panel / blur races cannot
                // cancel a click before navigation starts.
                e.preventDefault();
                onSelect(item);
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 ${
                selected ? "bg-teal-50" : "hover:bg-gray-50"
              }`}
            >
              {item.kind === "product" ? (
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-[#FAFAF8]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-contain p-1"
                      unoptimized={isRemoteImage(item.image)}
                    />
                  ) : null}
                </span>
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                  {item.image ? (
                    <span className="relative h-full w-full overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                        unoptimized={isRemoteImage(item.image)}
                      />
                    </span>
                  ) : (
                    <SuggestionIcon kind={item.kind} />
                  )}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">
                  <MatchHighlight text={item.label} query={query} />
                </span>
                {item.meta ? (
                  <span className="mt-0.5 block truncate text-xs text-gray-500">
                    {item.meta}
                  </span>
                ) : null}
              </span>

              {item.priceLabel ? (
                <span className="shrink-0 text-sm font-semibold tabular-nums text-teal-800">
                  {item.priceLabel}
                </span>
              ) : null}
            </button>
          </div>
        );
      })}

      {viewAll && (
        <div className="mt-1 border-t border-gray-100 pt-1">
          <button
            type="button"
            id={viewAll.id}
            role="option"
            aria-selected={suggestions.indexOf(viewAll) === activeIndex}
            onMouseEnter={() => onHover(suggestions.indexOf(viewAll))}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(viewAll);
            }}
            className={`flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm font-semibold transition-colors ${
              suggestions.indexOf(viewAll) === activeIndex
                ? "bg-teal-50 text-teal-900"
                : "text-teal-800 hover:bg-teal-50/70"
            }`}
          >
            <span className="truncate">
              <MatchHighlight text={viewAll.label} query={query} />
            </span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

export const SearchSuggestions = memo(SearchSuggestionsComponent);
