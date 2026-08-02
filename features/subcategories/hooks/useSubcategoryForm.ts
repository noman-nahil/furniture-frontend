// features/subcategories/hooks/useSubcategoryForm.ts
"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { subcategoriesApi } from "../api/subcategoriesApi";
import { EMPTY_FORM } from "../constants";
import { invalidateSubcategories } from "./useSubcategories";
import { useSubcategoryImageUploader } from "./useSubcategoryImageUploader";
import type { Subcategory, SubcategoryFormValues } from "../types";

function validate(form: SubcategoryFormValues): string | null {
  if (!form.name.trim()) return "Name is required.";
  if (!form.parentCategory) return "Parent category is required.";
  return null;
}

export function useSubcategoryForm(onSaved?: (subcategory: Subcategory) => void) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SubcategoryFormValues>({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [existingImage, setExistingImage] = useState<string | undefined>(undefined);
  const [existingSlug, setExistingSlug] = useState<string | undefined>(undefined);

  const {
    staged,
    removeExisting,
    setFile,
    clear: clearImage,
    markRemoveExisting,
    undoRemoveExisting,
    hasError: imageHasError,
  } = useSubcategoryImageUploader();

  const imageUploader = {
    staged,
    removeExisting,
    setFile,
    clear: clearImage,
    markRemoveExisting,
    undoRemoveExisting,
    hasError: imageHasError,
  };

  const isDirty =
    form.name.trim() !== "" ||
    form.parentCategory !== "" ||
    staged != null ||
    removeExisting;

  const handleChange = useCallback(
    <K extends keyof SubcategoryFormValues>(field: K, value: SubcategoryFormValues[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
    setExistingImage(undefined);
    setExistingSlug(undefined);
    clearImage();
  }, [clearImage]);

  const startEdit = useCallback(
    (s: Subcategory) => {
      setEditingId(s._id);
      setError(null);
      setForm({
        name: s.name,
        parentCategory: s.parentCategoryId,
        isActive: s.isActive,
      });
      setExistingImage(s.image);
      setExistingSlug(s.slug);
      clearImage();
    },
    [clearImage],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      const validationError = validate(form);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (imageHasError) {
        setError("Remove the invalid file before saving.");
        return;
      }

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("parentCategory", form.parentCategory);
      fd.append("isActive", String(form.isActive));

      // The backend only replaces the image when a file is present, so the
      // explicit "remove, don't replace" intent needs its own flag.
      if (staged?.file) {
        fd.append("image", staged.file);
      } else if (removeExisting) {
        fd.append("removeImage", "true");
      }

      try {
        setSaving(true);

        const saved = editingId
          ? await subcategoriesApi.update(editingId, fd)
          : await subcategoriesApi.create(fd);

        invalidateSubcategories(qc);
        toast.success(editingId ? "Subcategory updated." : "Subcategory created.");
        onSaved?.(saved);
        resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save subcategory.");
      } finally {
        setSaving(false);
      }
    },
    [editingId, form, staged, removeExisting, imageHasError, onSaved, qc, resetForm],
  );

  return {
    form,
    editingId,
    error,
    saving,
    isDirty,
    existingImage,
    existingSlug,
    imageUploader,
    handleChange,
    handleSubmit,
    resetForm,
    startEdit,
  };
}
