// features/categories/hooks/useCategoryForm.ts

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { slugify } from "@/lib/slug";
import { categoriesApi } from "../api/categoriesApi";
import { useCategoryImageUploader } from "./useCategoryImageUploader";
import type { Category, CategoryFormValues } from "../types";

const EMPTY_FORM: CategoryFormValues = { name: "", slug: "", isActive: true };

export function useCategoryForm() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormValues>({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [existingImage, setExistingImage] = useState<string | undefined>(undefined);
  const imageUploader = useCategoryImageUploader();

  const handleChange = useCallback(
    <K extends keyof CategoryFormValues>(field: K, value: CategoryFormValues[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
    setExistingImage(undefined);
    imageUploader.clear();
  }, [imageUploader]);

  const startEdit = useCallback(
    (c: Category) => {
      setEditingId(c._id);
      setError(null);
      setForm({ name: c.name, slug: c.slug, isActive: c.isActive !== false });
      setExistingImage(c.image);
      imageUploader.clear();
    },
    [imageUploader]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const name = form.name.trim();
      const slug = form.slug.trim() || slugify(name);
      if (!name || !slug) {
        setError("Name and slug are required.");
        return;
      }
      if (imageUploader.hasError) {
        setError("Fix the image error before saving.");
        return;
      }

      const fd = new FormData();
      fd.append("name", name);
      fd.append("slug", slug);
      fd.append("isActive", String(form.isActive));
      // Only append if a new file was actually staged — the backend
      // (categoryService.updateCategory) only replaces the image when
      // req.file is present, leaving the existing one untouched otherwise.
      if (imageUploader.staged?.file) {
        fd.append("image", imageUploader.staged.file);
      } else if (imageUploader.removeExisting) {
        // NEW: was never sent before — the "remove existing image" UI
        // control set imageUploader.removeExisting state, but nothing
        // forwarded that intent into the submitted FormData, so
        // categoryController.update always received removeImage as
        // false regardless of what the admin clicked. This is what
        // actually wires the remove-image feature to the backend.
        fd.append("removeImage", "true");
      }

      try {
        setSaving(true);
        if (editingId) {
          await categoriesApi.update(editingId, fd);
          toast.success("Category updated.");
        } else {
          await categoriesApi.create(fd);
          toast.success("Category created.");
        }
        qc.invalidateQueries({ queryKey: ["admin-categories"] });
        resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save category.");
      } finally {
        setSaving(false);
      }
    },
    [editingId, form, imageUploader, qc, resetForm]
  );

  return {
    form,
    editingId,
    error,
    saving,
    existingImage,
    imageUploader,
    handleChange,
    handleSubmit,
    resetForm,
    startEdit,
  };
}