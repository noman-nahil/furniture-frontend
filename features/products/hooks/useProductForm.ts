// features/products/hooks/useProductForm.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productsApi } from "../api/productsApi";
import { EMPTY_FORM } from "../constants";
import { useImageUploader } from "./useImageUploader";
import type { Product, ProductFormValues } from "../types";

function validate(form: ProductFormValues): string | null {
  const priceNum = Number(form.price);
  const discPct = form.discount === "" ? 0 : Number(form.discount);
  const discPriceNum = form.discountPrice ? Number(form.discountPrice) : undefined;
  const qtyNum = form.quantity === "" ? 0 : Number(form.quantity);

  // name.fr is required to match the backend schema (name.fr: required, en optional).
  if (!form.name.fr.trim() || !form.category) return "French name and category are required.";
  if (Number.isNaN(priceNum) || priceNum < 0) return "Price must be zero or greater.";
  if (form.quantity !== "" && (Number.isNaN(qtyNum) || qtyNum < 0)) return "Quantity cannot be negative.";
  if (form.discount !== "" && (Number.isNaN(discPct) || discPct < 0 || discPct > 100))
    return "Discount must be a number between 0 and 100.";
  if (discPriceNum != null && (Number.isNaN(discPriceNum) || discPriceNum < 0))
    return "Discount price cannot be negative.";
  if (discPriceNum != null && discPriceNum > priceNum) return "Discount price cannot exceed the list price.";

  return null;
}

function keywordsToArray(csv: string): string[] {
  return csv
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function buildSeoPayload(seo: ProductFormValues["seo"]["fr"]) {
  const out: Record<string, unknown> = {};
  if (seo.metaTitle.trim()) out.metaTitle = seo.metaTitle.trim();
  if (seo.metaDescription.trim()) out.metaDescription = seo.metaDescription.trim();
  const keywords = keywordsToArray(seo.keywords);
  if (keywords.length > 0) out.keywords = keywords;
  if (seo.ogImage.trim()) out.ogImage = seo.ogImage.trim();
  if (seo.canonicalUrl.trim()) out.canonicalUrl = seo.canonicalUrl.trim();
  return out;
}

/**
 * Builds the plain JSON payload object matching the backend's nested
 * schema shape. This is stringified into a single "payload" field on the
 * FormData (see handleSubmit) rather than expanded into bracket-notation
 * multipart fields — multer doesn't auto-nest those the way qs/urlencoded
 * parsers do, so a single JSON blob is the unambiguous choice here.
 * REQUIRES a matching backend change to JSON.parse(req.body.payload)
 * before normalizeProductPayload runs — see chat notes.
 */
function buildPayloadObject(form: ProductFormValues) {
  const priceNum = Number(form.price);
  const discPct = form.discount === "" ? 0 : Number(form.discount);
  const discPriceNum = form.discountPrice ? Number(form.discountPrice) : undefined;

  const name: Record<string, string> = { fr: form.name.fr.trim() };
  if (form.name.en.trim()) name.en = form.name.en.trim();

  const description: Record<string, string> = {};
  if (form.description.fr.trim()) description.fr = form.description.fr.trim();
  if (form.description.en.trim()) description.en = form.description.en.trim();

  const structuredData: Record<string, unknown> = { condition: form.structuredData.condition };
  if (form.structuredData.gtin.trim()) structuredData.gtin = form.structuredData.gtin.trim();
  if (form.structuredData.mpn.trim()) structuredData.mpn = form.structuredData.mpn.trim();
  if (form.structuredData.brand.trim()) structuredData.brand = form.structuredData.brand.trim();

  return {
    name,
    description,
    price: priceNum,
    quantity: form.quantity === "" ? 0 : Number(form.quantity),
    category: form.category,
    subcategory: form.subcategory || undefined,
    discount: discPct,
    discountPrice: discPriceNum != null && discPriceNum > 0 ? discPriceNum : undefined,
    status: form.status,
    discountStartsAt: form.discountStartsAt ? new Date(form.discountStartsAt).toISOString() : null,
    discountEndsAt: form.discountEndsAt ? new Date(form.discountEndsAt).toISOString() : null,
    seo: {
      fr: buildSeoPayload(form.seo.fr),
      en: buildSeoPayload(form.seo.en),
    },
    structuredData,
    noIndex: form.noIndex,
  };
}

function seoFromProduct(seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[]; ogImage?: string; canonicalUrl?: string }) {
  return {
    metaTitle: seo?.metaTitle ?? "",
    metaDescription: seo?.metaDescription ?? "",
    keywords: (seo?.keywords ?? []).join(", "),
    ogImage: seo?.ogImage ?? "",
    canonicalUrl: seo?.canonicalUrl ?? "",
  };
}

export function useProductForm(onSaved?: (product: Product) => void) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormValues>({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedExistingKeys, setRemovedExistingKeys] = useState<string[]>([]);
  const activeExistingImages = existingImages.filter((k) => !removedExistingKeys.includes(k));

  const imageUploader = useImageUploader(activeExistingImages.length);

  const isDirty =
    form.name.fr.trim() !== "" ||
    form.price !== "" ||
    imageUploader.files.length > 0 ||
    removedExistingKeys.length > 0;

  const handleChange = useCallback(
    <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleNameChange = useCallback((locale: "fr" | "en", value: string) => {
    setForm((prev) => ({ ...prev, name: { ...prev.name, [locale]: value } }));
  }, []);

  const handleDescriptionChange = useCallback((locale: "fr" | "en", value: string) => {
    setForm((prev) => ({ ...prev, description: { ...prev.description, [locale]: value } }));
  }, []);

  const handleSeoChange = useCallback(
    (locale: "fr" | "en", field: keyof ProductFormValues["seo"]["fr"], value: string) => {
      setForm((prev) => ({
        ...prev,
        seo: { ...prev.seo, [locale]: { ...prev.seo[locale], [field]: value } },
      }));
    },
    []
  );

  const handleStructuredDataChange = useCallback(
    <K extends keyof ProductFormValues["structuredData"]>(
      field: K,
      value: ProductFormValues["structuredData"][K]
    ) => {
      setForm((prev) => ({ ...prev, structuredData: { ...prev.structuredData, [field]: value } }));
    },
    []
  );

  const resetImages = imageUploader.reset;

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
    setExistingImages([]);
    setRemovedExistingKeys([]);
    resetImages();
  }, [resetImages]);

  const startEdit = useCallback(
    (p: Product) => {
      setEditingId(p._id);
      setError(null);
      setForm({
        name: { fr: p.name?.fr ?? "", en: p.name?.en ?? "" },
        description: { fr: p.description?.fr ?? "", en: p.description?.en ?? "" },
        price: String(p.price ?? ""),
        quantity: String(p.quantity ?? ""),
        category: p.category ?? "",
        subcategory: p.subcategory ?? "",
        discount: String(p.discount ?? ""),
        discountPrice: p.discountPrice != null ? String(p.discountPrice) : "",
        status: p.status ?? "active",
        discountStartsAt: p.discountStartsAt
          ? new Date(p.discountStartsAt).toISOString().slice(0, 16)
          : "",
        discountEndsAt: p.discountEndsAt
          ? new Date(p.discountEndsAt).toISOString().slice(0, 16)
          : "",
        seo: {
          fr: seoFromProduct(p.seo?.fr),
          en: seoFromProduct(p.seo?.en),
        },
        structuredData: {
          gtin: p.structuredData?.gtin ?? "",
          mpn: p.structuredData?.mpn ?? "",
          brand: p.structuredData?.brand ?? "",
          condition: p.structuredData?.condition ?? "NewCondition",
        },
        noIndex: p.noIndex ?? false,
      });
      setExistingImages(p.images ?? []);
      setRemovedExistingKeys([]);
      resetImages();
    },
    [resetImages],
  );

  const removeExistingImage = useCallback((key: string) => {
    setRemovedExistingKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      const validationError = validate(form);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (imageUploader.hasErrors) {
        setError("Remove invalid files before saving.");
        return;
      }

      const fd = new FormData();
      fd.append("payload", JSON.stringify(buildPayloadObject(form)));
      imageUploader.files.forEach((f) => fd.append("images", f.file));

      try {
        setSaving(true);

        if (editingId) {
          removedExistingKeys.forEach((key) => fd.append("removeImages", key));
          const updated = await productsApi.update(editingId, fd);
          qc.invalidateQueries({ queryKey: ["products"] });
          toast.success("Product updated.");
          onSaved?.(updated);
          resetForm();
        } else {
          const created = await productsApi.create(fd);
          qc.invalidateQueries({ queryKey: ["products"] });
          toast.success("Product created.");
          onSaved?.(created);
          resetForm();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save product.");
      } finally {
        setSaving(false);
      }
    },
    [editingId, form, imageUploader, onSaved, qc, resetForm, removedExistingKeys]
  );

  return useMemo(
    () => ({
      form,
      editingId,
      error,
      saving,
      isDirty,
      imageUploader,
      activeExistingImages,
      removeExistingImage,
      handleChange,
      handleNameChange,
      handleDescriptionChange,
      handleSeoChange,
      handleStructuredDataChange,
      handleSubmit,
      resetForm,
      startEdit,
    }),
    [
      form,
      editingId,
      error,
      saving,
      isDirty,
      imageUploader,
      activeExistingImages,
      removeExistingImage,
      handleChange,
      handleNameChange,
      handleDescriptionChange,
      handleSeoChange,
      handleStructuredDataChange,
      handleSubmit,
      resetForm,
      startEdit,
    ],
  );
}