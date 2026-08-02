"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const ITEMS_PER_PAGE_OPTIONS = [12, 15, 21, 30] as const;
export type ItemsPerPageOption = (typeof ITEMS_PER_PAGE_OPTIONS)[number];

const STORAGE_KEY = "itemsPerPage";

function isAllowed(n: number): n is ItemsPerPageOption {
  return (ITEMS_PER_PAGE_OPTIONS as readonly number[]).includes(n);
}

function responsiveDefault(): ItemsPerPageOption {
  if (typeof window === "undefined") return 12;
  const w = window.innerWidth;
  if (w < 640) return 12;
  if (w <= 1024) return 15;
  return 21;
}

function readStoredItemsPerPage(): ItemsPerPageOption | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return isAllowed(n) ? n : null;
  } catch {
    return null;
  }
}

export type UsePaginationResult<T> = {
  currentPage: number;
  totalPages: number;
  itemsPerPage: ItemsPerPageOption;
  paginatedItems: T[];
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  setItemsPerPage: (n: ItemsPerPageOption) => void;
  ready: boolean;
};

export function usePagination<T>(items: T[]): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] =
    useState<ItemsPerPageOption>(12);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredItemsPerPage();
    setItemsPerPageState(stored ?? responsiveDefault());
    setReady(true);
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / itemsPerPage) || 1,
  );

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const scrollTop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setPage = useCallback(
    (page: number) => {
      const p = Math.min(Math.max(1, Math.floor(page)), totalPages);
      setCurrentPage(p);
      scrollTop();
    },
    [totalPages, scrollTop],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((p) => {
      const np = Math.min(p + 1, totalPages);
      if (np !== p) scrollTop();
      return np;
    });
  }, [totalPages, scrollTop]);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => {
      const np = Math.max(p - 1, 1);
      if (np !== p) scrollTop();
      return np;
    });
  }, [scrollTop]);

  const setItemsPerPage = useCallback((n: ItemsPerPageOption) => {
    if (!isAllowed(n)) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(n));
    } catch {
      /* ignore */
    }
    setItemsPerPageState(n);
    setCurrentPage(1);
    scrollTop();
  }, [scrollTop]);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    nextPage,
    prevPage,
    setPage,
    setItemsPerPage,
    ready,
  };
}
