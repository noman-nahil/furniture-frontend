// features/banners/hooks/useBannerForm.ts
"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EMPTY_FORM } from "../constants";
import { bannersApi } from "../api/bannersApi";
import { useBannerImageUploader } from "./useBannerImageUploader";
import type { Banner, BannerFormValues } from "../types";

export function useBannerForm() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormValues>({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [existingImage, setExistingImage] = useState<string | undefined>(undefined);
  const imageUploader = useBannerImageUploader();

  const handleChange = useCallback(
    <K extends keyof BannerFormValues>(field: K, value: BannerFormValues[K]) => {
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
    (banner: Banner) => {
      setEditingId(banner._id);
      setError(null);
      setForm({
        title: banner.title ?? "",
        alt: banner.alt ?? "",
        sortOrder: String(banner.sortOrder ?? 0),
        status: banner.status,
      });
      setExistingImage(banner.image);
      imageUploader.clear();
    },
    [imageUploader]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (imageUploader.hasError) {
        setError("Fix the image error before saving.");
        return;
      }
      // POST /banners rejects a request with no file, so catch it here
      // rather than round-tripping to find out.
      if (!editingId && !imageUploader.staged) {
        setError("A banner image is required.");
        return;
      }

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("alt", form.alt.trim());
      fd.append("status", form.status);
      if (form.sortOrder.trim()) {
        fd.append("sortOrder", form.sortOrder.trim());
      }

      // Only append the file when one was actually staged — the backend
      // (bannerService.updateBanner) only replaces the image when req.file
      // is present, leaving the existing one untouched otherwise.
      if (imageUploader.staged?.file) {
        fd.append("image", imageUploader.staged.file);
      } else if (imageUploader.removeExisting) {
        fd.append("removeImage", "true");
      }

      try {
        setSaving(true);
        if (editingId) {
          await bannersApi.update(editingId, fd);
          toast.success("Banner updated.");
        } else {
          await bannersApi.create(fd);
          toast.success("Banner created.");
        }
        qc.invalidateQueries({ queryKey: ["admin-banners"] });
        resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save banner.");
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
