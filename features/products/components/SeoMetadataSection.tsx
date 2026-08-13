// features/products/components/SeoMetadataSection.tsx
"use client";

import { useState } from "react";
import type { ProductFormValues, SeoFormValues } from "../types";

type SeoMetadataSectionProps = {
  seo: ProductFormValues["seo"];
  structuredData: ProductFormValues["structuredData"];
  noIndex: boolean;
  onSeoChange: (locale: "fr" | "en", field: keyof SeoFormValues, value: string) => void;
  onStructuredDataChange: <K extends keyof ProductFormValues["structuredData"]>(
    field: K,
    value: ProductFormValues["structuredData"][K]
  ) => void;
  onNoIndexChange: (value: boolean) => void;
  /** expanded = always visible (modal); collapsible = accordion (legacy). */
  variant?: "collapsible" | "expanded";
};

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 outline-none placeholder-slate-500 focus:ring-1 focus:ring-slate-300";
const labelClass = "mb-1 block text-xs font-medium text-slate-200";

export function SeoMetadataSection({
  seo,
  structuredData,
  noIndex,
  onSeoChange,
  onStructuredDataChange,
  onNoIndexChange,
  variant = "collapsible",
}: SeoMetadataSectionProps) {
  const [activeLocale, setActiveLocale] = useState<"fr" | "en">("fr");
  const activeSeo = seo[activeLocale];

  const localeTabs = (
    <div className="flex gap-1 rounded-lg bg-slate-950 p-1">
      {(["fr", "en"] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => setActiveLocale(locale)}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
            activeLocale === locale
              ? "bg-slate-800 text-slate-50"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {locale === "fr" ? "French" : "English"}
        </button>
      ))}
    </div>
  );

  const seoFields = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor={`seo-title-${activeLocale}`} className={labelClass}>
          Meta title <span className="text-slate-500">(70)</span>
        </label>
        <input
          id={`seo-title-${activeLocale}`}
          type="text"
          maxLength={70}
          value={activeSeo.metaTitle}
          onChange={(e) => onSeoChange(activeLocale, "metaTitle", e.target.value)}
          className={inputClass}
          placeholder="Search result title"
        />
      </div>
      <div>
        <label htmlFor={`seo-keywords-${activeLocale}`} className={labelClass}>
          Keywords
        </label>
        <input
          id={`seo-keywords-${activeLocale}`}
          type="text"
          value={activeSeo.keywords}
          onChange={(e) => onSeoChange(activeLocale, "keywords", e.target.value)}
          className={inputClass}
          placeholder="sofa, living room"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`seo-desc-${activeLocale}`} className={labelClass}>
          Meta description <span className="text-slate-500">(160)</span>
        </label>
        <textarea
          id={`seo-desc-${activeLocale}`}
          maxLength={160}
          rows={2}
          value={activeSeo.metaDescription}
          onChange={(e) => onSeoChange(activeLocale, "metaDescription", e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Search result snippet"
        />
      </div>
      <div>
        <label htmlFor={`seo-ogimage-${activeLocale}`} className={labelClass}>
          OG image URL
        </label>
        <input
          id={`seo-ogimage-${activeLocale}`}
          type="text"
          value={activeSeo.ogImage}
          onChange={(e) => onSeoChange(activeLocale, "ogImage", e.target.value)}
          className={inputClass}
          placeholder="Defaults to first product image"
        />
      </div>
      <div>
        <label htmlFor={`seo-canonical-${activeLocale}`} className={labelClass}>
          Canonical URL
        </label>
        <input
          id={`seo-canonical-${activeLocale}`}
          type="text"
          value={activeSeo.canonicalUrl}
          onChange={(e) => onSeoChange(activeLocale, "canonicalUrl", e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </div>
    </div>
  );

  const structuredFields = (
    <>
      <p className="mb-2 text-xs font-medium text-slate-300">Structured data</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="structured-gtin" className={labelClass}>
            GTIN
          </label>
          <input
            id="structured-gtin"
            type="text"
            value={structuredData.gtin}
            onChange={(e) => onStructuredDataChange("gtin", e.target.value)}
            className={inputClass}
            placeholder="Barcode"
          />
        </div>
        <div>
          <label htmlFor="structured-mpn" className={labelClass}>
            MPN
          </label>
          <input
            id="structured-mpn"
            type="text"
            value={structuredData.mpn}
            onChange={(e) => onStructuredDataChange("mpn", e.target.value)}
            className={inputClass}
            placeholder="Part number"
          />
        </div>
        <div>
          <label htmlFor="structured-brand" className={labelClass}>
            Brand
          </label>
          <input
            id="structured-brand"
            type="text"
            value={structuredData.brand}
            onChange={(e) => onStructuredDataChange("brand", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="structured-condition" className={labelClass}>
            Condition
          </label>
          <select
            id="structured-condition"
            value={structuredData.condition}
            onChange={(e) =>
              onStructuredDataChange(
                "condition",
                e.target.value as ProductFormValues["structuredData"]["condition"]
              )
            }
            className={inputClass}
          >
            <option value="NewCondition">New</option>
            <option value="UsedCondition">Used</option>
            <option value="RefurbishedCondition">Refurbished</option>
          </select>
        </div>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={noIndex}
          onChange={(e) => onNoIndexChange(e.target.checked)}
          className="rounded border-slate-600"
        />
        Hide from search engines (noindex)
      </label>
    </>
  );

  const fields = (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <div className="space-y-3">
        {localeTabs}
        {seoFields}
      </div>
      <div>{structuredFields}</div>
    </div>
  );

  if (variant === "expanded") {
    return fields;
  }

  return (
    <details className="group rounded-lg border border-slate-800/80 bg-slate-900/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-[13px] font-medium text-slate-100 sm:p-3.5 [&::-webkit-details-marker]:hidden">
        <span>
          SEO &amp; metadata
          <span className="ml-2 text-[11px] font-normal text-slate-500">Optional — click to edit</span>
        </span>
        <span className="text-slate-500 transition-transform group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="border-t border-slate-800 px-3 pb-3.5 pt-3 sm:px-3.5">{fields}</div>
    </details>
  );
}