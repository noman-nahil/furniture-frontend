"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import SearchField, {
  SEARCH_FIELD_INPUT_CLASS,
} from "@/components/search/SearchField";
import { useProductSearch, type ProductSearchController } from "@/hooks/useProductSearch";
import type { CategoryNav } from "@/types/categoryNav";

const SearchCtx = createContext<ProductSearchController | null>(null);

/** Owns useProductSearch — suspends alone so category nav can paint first. */
export function NavbarSearchProvider({
  categories,
  children,
}: {
  categories: CategoryNav[];
  children: ReactNode;
}) {
  const search = useProductSearch({ categories });
  return <SearchCtx.Provider value={search}>{children}</SearchCtx.Provider>;
}

export function NavbarSearchField({
  active,
  className = SEARCH_FIELD_INPUT_CLASS,
}: {
  active: boolean;
  className?: string;
}) {
  const search = useContext(SearchCtx);
  if (!search) {
    return (
      <div
        className="h-10 w-full max-w-2xl rounded-xl bg-gray-100 animate-pulse"
        aria-hidden
      />
    );
  }
  return (
    <SearchField search={search} active={active} className={className} />
  );
}

export { SEARCH_FIELD_INPUT_CLASS };
