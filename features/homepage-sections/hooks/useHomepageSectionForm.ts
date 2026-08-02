// features/homepage-sections/hooks/useHomepageSectionForm.ts
"use client";

import { useCallback, useState } from "react";
import { slugify } from "@/lib/slug";
import { EMPTY_FORM } from "../constants";
import { useSaveHomepageSection } from "./useHomepageSectionMutations";
import type {
  HomepageSectionFormValues,
  HomepageSectionSummary,
  HomepageSectionTypeOption,
} from "../types";

/**
 * Section details form (admin only). Products are curated separately, so this
 * never sends a `products` field — the two concerns save independently and a
 * manager's product edits can't be clobbered by an admin saving the title.
 */
export function useHomepageSectionForm() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HomepageSectionFormValues>({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);

  const saveSection = useSaveHomepageSection();

  const handleChange = useCallback(
    <K extends keyof HomepageSectionFormValues>(
      field: K,
      value: HomepageSectionFormValues[K],
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const close = useCallback(() => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
  }, []);

  /** Picking a type on a new section fills in the registry's suggested title. */
  const selectType = useCallback((type: HomepageSectionTypeOption | null) => {
    setForm((prev) => ({
      ...prev,
      sectionType: type?.key ?? "",
      title: prev.title || type?.defaultTitle || "",
      slug: prev.slug || slugify(type?.defaultTitle ?? ""),
    }));
  }, []);

  const startCreate = useCallback((type?: HomepageSectionTypeOption) => {
    setEditingId(null);
    setError(null);
    setForm({
      ...EMPTY_FORM,
      sectionType: type?.key ?? "",
      title: type?.defaultTitle ?? "",
      slug: slugify(type?.defaultTitle ?? ""),
    });
    setOpen(true);
  }, []);

  const startEdit = useCallback((section: HomepageSectionSummary) => {
    setEditingId(section._id);
    setError(null);
    setForm({
      title: section.title,
      slug: section.slug,
      sectionType: section.sectionType,
      status: section.status,
      sortOrder: String(section.sortOrder ?? 0),
      limit: String(section.limit ?? ""),
    });
    setOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const title = form.title.trim();
      if (!title) {
        setError("A title is required.");
        return;
      }
      if (!editingId && !form.sectionType) {
        setError("Pick a section type.");
        return;
      }

      const sortOrder = form.sortOrder.trim();
      const limit = form.limit.trim();

      saveSection.mutate(
        {
          id: editingId,
          payload: {
            title,
            // Blank means "derive from the title" on create, "leave alone" on edit.
            ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
            ...(editingId ? {} : { sectionType: form.sectionType }),
            status: form.status,
            ...(sortOrder ? { sortOrder: Number(sortOrder) } : {}),
            ...(limit ? { limit: Number(limit) } : {}),
          },
        },
        {
          onSuccess: close,
          onError: (err) =>
            setError(
              err instanceof Error ? err.message : "Failed to save section.",
            ),
        },
      );
    },
    [close, editingId, form, saveSection],
  );

  return {
    open,
    form,
    editingId,
    error,
    saving: saveSection.isPending,
    handleChange,
    selectType,
    startCreate,
    startEdit,
    handleSubmit,
    close,
  };
}
