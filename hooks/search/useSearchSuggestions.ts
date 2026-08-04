"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "@/lib/image";
import { formatBDT, getFinalPrice } from "@/lib/productPrice";
import { buildCategorySuggestions } from "@/lib/search/buildCategorySuggestions";
import {
  SUGGEST_DEBOUNCE_MS,
  SUGGEST_PRODUCT_LIMIT,
  buildSearchResultsHref,
  isSearchableQuery,
  normalizeSearch,
} from "@/lib/search/normalize";
import { sortByRelevance } from "@/lib/search/ranking";
import {
  SearchRequestError,
  mongoSearchClient,
} from "@/lib/search/mongoSearchClient";
import type { ProductSearchClient, SearchSuggestion, SuggestErrorKind } from "@/lib/search/types";
import type { CategoryNav } from "@/types/categoryNav";
import type { LocalizedField } from "@/types/product";

function pickLocale(field: LocalizedField | undefined, locale: "fr" | "en"): string {
  if (!field) return "";
  return field[locale] || field.fr || "";
}

type Options = {
  categories: CategoryNav[];
  locale?: "fr" | "en";
  client?: ProductSearchClient;
};

export function useSearchSuggestions({
  categories,
  locale = "fr",
  client = mongoSearchClient,
}: Options) {
  const [productSuggestions, setProductSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<{
    kind: SuggestErrorKind;
    message: string;
  } | null>(null);

  const suggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastSuggestKeyRef = useRef("");
  const requestIdRef = useRef(0);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) map.set(cat._id, cat.name);
    return map;
  }, [categories]);

  useEffect(() => {
    return () => {
      if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const mapProducts = useCallback(
    (products: Awaited<ReturnType<ProductSearchClient["suggest"]>>["products"]) => {
      const mapped: SearchSuggestion[] = products.map((p) => {
        const name = pickLocale(p.name, locale);
        const slug = pickLocale(p.slug, locale);
        const categoryId = typeof p.category === "string" ? p.category : "";
        const skuHints = [
          p.structuredData?.mpn,
          p.structuredData?.gtin,
        ].filter((v): v is string => Boolean(v));

        return {
          id: `product-${p._id}`,
          kind: "product" as const,
          label: name,
          href: slug
            ? `/products/${slug}`
            : buildSearchResultsHref(normalizeSearch(name)),
          image: getImageUrl(p.images?.[0]),
          meta:
            categoryNameById.get(categoryId) ||
            p.structuredData?.brand ||
            undefined,
          priceLabel: formatBDT(getFinalPrice(p)),
          skuHints,
        };
      });
      return mapped;
    },
    [locale, categoryNameById],
  );

  const fetchSuggestions = useCallback(
    async (rawQuery: string) => {
      const q = normalizeSearch(rawQuery);
      if (!isSearchableQuery(q)) {
        setProductSuggestions([]);
        setIsSuggestLoading(false);
        setSuggestError(null);
        lastSuggestKeyRef.current = "";
        return;
      }

      if (lastSuggestKeyRef.current === q) {
        setIsSuggestLoading(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const reqId = ++requestIdRef.current;
      setIsSuggestLoading(true);
      setSuggestError(null);

      try {
        const res = await client.suggest({
          query: q,
          limit: SUGGEST_PRODUCT_LIMIT,
          signal: controller.signal,
        });
        if (reqId !== requestIdRef.current) return;
        lastSuggestKeyRef.current = q;
        setProductSuggestions(sortByRelevance(mapProducts(res.products), q));
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        if (reqId !== requestIdRef.current) return;
        lastSuggestKeyRef.current = "";
        setProductSuggestions([]);
        if (err instanceof SearchRequestError) {
          setSuggestError({ kind: err.kind, message: err.message });
        } else {
          setSuggestError({
            kind: "unknown",
            message: "Something went wrong. Please try again.",
          });
        }
      } finally {
        if (abortRef.current === controller) {
          setIsSuggestLoading(false);
        }
      }
    },
    [client, mapProducts],
  );

  const scheduleSuggest = useCallback(
    (value: string) => {
      if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
      const q = normalizeSearch(value);

      if (!isSearchableQuery(q)) {
        abortRef.current?.abort();
        setProductSuggestions([]);
        setIsSuggestLoading(false);
        setSuggestError(null);
        lastSuggestKeyRef.current = "";
        return;
      }

      setIsSuggestLoading(true);
      suggestDebounceRef.current = setTimeout(() => {
        suggestDebounceRef.current = null;
        void fetchSuggestions(value);
      }, SUGGEST_DEBOUNCE_MS);
    },
    [fetchSuggestions],
  );

  const resetSuggestions = useCallback(() => {
    if (suggestDebounceRef.current) {
      clearTimeout(suggestDebounceRef.current);
      suggestDebounceRef.current = null;
    }
    abortRef.current?.abort();
    setProductSuggestions([]);
    setIsSuggestLoading(false);
    setSuggestError(null);
    lastSuggestKeyRef.current = "";
  }, []);

  const retrySuggest = useCallback(
    (query: string) => {
      lastSuggestKeyRef.current = "";
      void fetchSuggestions(query);
    },
    [fetchSuggestions],
  );

  const getMergedSuggestions = useCallback(
    (searchQuery: string): SearchSuggestion[] => {
      const q = normalizeSearch(searchQuery);
      if (!isSearchableQuery(q)) return [];

      const cats = buildCategorySuggestions(categories, q);
      const products = productSuggestions;
      const merged = sortByRelevance([...cats, ...products], q);

      merged.push({
        id: `view-all-${q}`,
        kind: "viewAll",
        label: `View all results for “${q}”`,
        href: buildSearchResultsHref(q),
      });

      return merged;
    },
    [categories, productSuggestions],
  );

  return {
    productSuggestions,
    isSuggestLoading,
    suggestError,
    scheduleSuggest,
    resetSuggestions,
    retrySuggest,
    getMergedSuggestions,
    fetchSuggestions,
  };
}
