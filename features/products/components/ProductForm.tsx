// features/products/components/ProductForm.tsx
"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { discountBadgeLabel, getFinalPrice } from "@/lib/productPrice";
import { subcategoryParentKey } from "../utils/productFilters";
import { ImageUploader } from "./ImageUploader";
import { LocalizedNameFields } from "./LocalizedNameFields";
import { ProductFormSection } from "./ProductFormSection";
import { SeoMetadataSection } from "./SeoMetadataSection";
import type { useProductForm } from "../hooks/useProductForm";
import type { Category, Subcategory } from "../types";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none placeholder-slate-500 focus:ring-1 focus:ring-slate-300";

type ProductFormProps = {
  formState: ReturnType<typeof useProductForm>;
  categories: Category[];
  subcategories: Subcategory[];
  /** When true, sectioned layout for ProductFormModal — no inline actions. */
  embedded?: boolean;
  /** Associates external submit button (modal footer). */
  formId?: string;
  /** Called when Cancel is pressed in standalone mode. */
  onCancel?: () => void;
};

export function ProductForm({
  formState,
  categories,
  subcategories,
  embedded = false,
  formId,
  onCancel,
}: ProductFormProps) {
  const {
    form,
    editingId,
    duplicatingFromId,
    error,
    saving,
    imageUploader,
    activeExistingImages,
    removeExistingImage,
    moveExistingImage,
    handleChange,
    handleNameChange,
    handleSlugChange,
    handleSlugBlur,
    handleSlugFromName,
    handleDescriptionChange,
    handleSeoChange,
    handleStructuredDataChange,
    handleSubmit,
    resetForm,
  } = formState;

  const subsForCategory = useMemo(
    () => (form.category ? subcategories.filter((s) => subcategoryParentKey(s) === String(form.category)) : []),
    [form.category, subcategories],
  );

  const previewProduct = useMemo(
    () => ({
      price: Number(form.price) || 0,
      discount: Number(form.discount) || 0,
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      discountStartsAt: form.discountStartsAt || undefined,
      discountEndsAt: form.discountEndsAt || undefined,
    }),
    [form.price, form.discount, form.discountPrice, form.discountStartsAt, form.discountEndsAt],
  );

  const previewFinal = getFinalPrice(previewProduct);
  const previewLabel = discountBadgeLabel(previewProduct);

  function handleCancel() {
    if (onCancel) {
      onCancel();
    } else {
      resetForm();
    }
  }

  const errorBanner = error ? (
    <p className="rounded-md border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-400">{error}</p>
  ) : null;

  const pricingFields = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="product-price" className="mb-1 block text-xs font-medium text-slate-200">
            Price
          </label>
          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className={inputClass}
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="product-discount" className="mb-1 block text-xs font-medium text-slate-200">
            Discount (%)
          </label>
          <input
            id="product-discount"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={form.discount}
            onChange={(e) => handleChange("discount", e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="product-discount-price" className="mb-1 block text-xs font-medium text-slate-200">
            Discount price <span className="text-slate-500">(optional)</span>
          </label>
          <input
            id="product-discount-price"
            type="number"
            min="0"
            step="0.01"
            value={form.discountPrice}
            onChange={(e) => handleChange("discountPrice", e.target.value)}
            className={inputClass}
            placeholder="Fixed price"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="discount-starts" className="mb-1 block text-xs font-medium text-slate-200">
            Discount starts <span className="text-slate-500">(optional)</span>
          </label>
          <input
            id="discount-starts"
            type="datetime-local"
            value={form.discountStartsAt}
            onChange={(e) => handleChange("discountStartsAt", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="discount-ends" className="mb-1 block text-xs font-medium text-slate-200">
            Discount ends <span className="text-slate-500">(optional)</span>
          </label>
          <input
            id="discount-ends"
            type="datetime-local"
            value={form.discountEndsAt}
            onChange={(e) => handleChange("discountEndsAt", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-400">
        <span className="text-slate-500">Price preview: </span>
        <span className="font-semibold tabular-nums text-slate-100">{formatCurrency(previewFinal)}</span>
        {previewLabel && <span className="ml-2 text-rose-400">{previewLabel}</span>}
      </div>
    </>
  );

  const categoryFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="product-category" className="mb-1 block text-xs font-medium text-slate-200">
          Category
        </label>
        <select
          id="product-category"
          value={form.category}
          onChange={(e) => {
            handleChange("category", e.target.value);
            handleChange("subcategory", "");
          }}
          className={inputClass}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="product-subcategory" className="mb-1 block text-xs font-medium text-slate-200">
          Subcategory
        </label>
        <select
          id="product-subcategory"
          value={form.subcategory}
          onChange={(e) => handleChange("subcategory", e.target.value)}
          className={inputClass}
        >
          <option value="">None</option>
          {subsForCategory.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const canManageExistingImages = Boolean(editingId || duplicatingFromId);

  const imageFields = (
    <ImageUploader
      files={imageUploader.files}
      onAddFiles={imageUploader.addFiles}
      onRemoveFile={imageUploader.removeFile}
      onMoveFile={imageUploader.moveFile}
      remaining={imageUploader.remaining}
      existingImages={activeExistingImages.map((key) => ({ key }))}
      onRemoveExisting={canManageExistingImages ? removeExistingImage : undefined}
      onMoveExisting={canManageExistingImages ? moveExistingImage : undefined}
    />
  );

  const standaloneActions = (
    <div className="flex items-center justify-end gap-2 pt-2">
      {(editingId || onCancel) && (
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white disabled:opacity-70"
      >
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        {saving ? (editingId ? "Saving…" : "Creating…") : editingId ? "Save changes" : duplicatingFromId ? "Create copy" : "Create product"}
      </button>
    </div>
  );

  if (embedded) {
    return (
      <div>
        {errorBanner}

        <form id={formId} onSubmit={handleSubmit} className="space-y-5">
          <ProductFormSection title="Basic Information" description="Names, URL slugs, and descriptions in French and English.">
            <LocalizedNameFields
              layout="grid"
              name={form.name}
              slug={form.slug}
              description={form.description}
              onNameChange={handleNameChange}
              onSlugChange={handleSlugChange}
              onSlugBlur={handleSlugBlur}
              onSlugFromName={handleSlugFromName}
              onDescriptionChange={handleDescriptionChange}
            />
          </ProductFormSection>

          <ProductFormSection title="Pricing" description="Base price, discounts, and promotional windows.">
            {pricingFields}
          </ProductFormSection>

          <ProductFormSection title="Inventory">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="product-quantity" className="mb-1 block text-xs font-medium text-slate-200">
                  Quantity
                </label>
                <input
                  id="product-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="product-status" className="mb-1 block text-xs font-medium text-slate-200">
                  Status
                </label>
                <select
                  id="product-status"
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value as typeof form.status)}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </ProductFormSection>

          <ProductFormSection title="Categories">{categoryFields}</ProductFormSection>

          <ProductFormSection
            title="SEO & Metadata"
            description="Search engine and social sharing settings per locale."
          >
            <SeoMetadataSection
              variant="expanded"
              seo={form.seo}
              structuredData={form.structuredData}
              noIndex={form.noIndex}
              onSeoChange={handleSeoChange}
              onStructuredDataChange={handleStructuredDataChange}
              onNoIndexChange={(value) => handleChange("noIndex", value)}
            />
          </ProductFormSection>

          <ProductFormSection title="Images" description="Up to 8 images. First is primary — use arrows to set order.">
            {imageFields}
          </ProductFormSection>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4">
      <div className="mb-3">
        <p className="text-xs font-medium text-slate-200">
          {editingId ? "Edit product" : duplicatingFromId ? "Duplicate product" : "Create product"}
        </p>
        <p className="text-[11px] text-slate-500">
          {editingId
            ? "Update fields and save."
            : duplicatingFromId
              ? "Change the name, slug, or any other fields, then create the copy."
              : "Upload images directly to Cloudflare R2."}
        </p>
      </div>

      {errorBanner}

      <form onSubmit={handleSubmit} className="space-y-3">
        <LocalizedNameFields
          name={form.name}
          slug={form.slug}
          description={form.description}
          onNameChange={handleNameChange}
          onSlugChange={handleSlugChange}
          onSlugBlur={handleSlugBlur}
          onSlugFromName={handleSlugFromName}
          onDescriptionChange={handleDescriptionChange}
        />

        {pricingFields}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="product-quantity-standalone" className="mb-1 block text-xs font-medium text-slate-200">
              Quantity
            </label>
            <input
              id="product-quantity-standalone"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="product-status-standalone" className="mb-1 block text-xs font-medium text-slate-200">
              Status
            </label>
            <select
              id="product-status-standalone"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as typeof form.status)}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {categoryFields}

        <SeoMetadataSection
          seo={form.seo}
          structuredData={form.structuredData}
          noIndex={form.noIndex}
          onSeoChange={handleSeoChange}
          onStructuredDataChange={handleStructuredDataChange}
          onNoIndexChange={(value) => handleChange("noIndex", value)}
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-200">Images</label>
          {imageFields}
        </div>

        {standaloneActions}
      </form>
    </div>
  );
}
