"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { SearchSuggestion } from "@/lib/search/types";

type Options = {
  suggestions: SearchSuggestion[];
  onCommitSearch: () => void;
  onSelectSuggestion: (item: SearchSuggestion) => void;
  onClear: () => void;
  hasQuery: boolean;
  panelAllowed: boolean;
};

export function useSearchCombobox({
  suggestions,
  onCommitSearch,
  onSelectSuggestion,
  onClear,
  hasQuery,
  panelAllowed,
}: Options) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const showPanel = isOpen && panelAllowed;

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const openPanel = useCallback(() => {
    if (!panelAllowed) return;
    setIsOpen(true);
  }, [panelAllowed]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  // Panel is portaled to document.body — must treat it as "inside"
  // or mousedown closes the list before click can select an item.
  useEffect(() => {
    if (!showPanel) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      closePanel();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showPanel, closePanel]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        if (!panelAllowed) return;
        if (suggestions.length === 0) {
          openPanel();
          return;
        }
        e.preventDefault();
        openPanel();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        return;
      }

      if (e.key === "ArrowUp") {
        if (suggestions.length === 0) return;
        e.preventDefault();
        openPanel();
        setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        return;
      }

      if (e.key === "Home" && showPanel && suggestions.length > 0) {
        e.preventDefault();
        setActiveIndex(0);
        return;
      }

      if (e.key === "End" && showPanel && suggestions.length > 0) {
        e.preventDefault();
        setActiveIndex(suggestions.length - 1);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (isOpen) {
          closePanel();
          return;
        }
        if (hasQuery) {
          onClear();
        } else {
          (e.target as HTMLInputElement).blur();
        }
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (showPanel && activeIndex >= 0 && suggestions[activeIndex]) {
          onSelectSuggestion(suggestions[activeIndex]);
          closePanel();
          return;
        }
        onCommitSearch();
        closePanel();
      }
    },
    [
      panelAllowed,
      suggestions,
      showPanel,
      isOpen,
      hasQuery,
      activeIndex,
      openPanel,
      closePanel,
      onClear,
      onCommitSearch,
      onSelectSuggestion,
    ],
  );

  const activeDescendant =
    showPanel && activeIndex >= 0 && suggestions[activeIndex]
      ? suggestions[activeIndex].id
      : undefined;

  return {
    inputId,
    listboxId,
    containerRef,
    panelRef,
    inputRef,
    isOpen,
    setIsOpen,
    activeIndex,
    setActiveIndex,
    showPanel,
    activeDescendant,
    openPanel,
    closePanel,
    handleKeyDown,
  };
}
