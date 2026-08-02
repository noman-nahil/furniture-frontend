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

  const content = (
    <div className="space-y-4">
        {/* Locale tabs — SEO fields are all optional and per-locale, so
            tabbing them keeps the form from doubling in length for
            products where only one locale's SEO actually matters. */}
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

        <div className="space-y-3">
          <div>
            <label htmlFor={`seo-title-${activeLocale}`} className={labelClass}>
              Meta title <span className="text-slate-500">(max 70 chars)</span>
            </label>
            <input
              id={`seo-title-${activeLocale}`}
              type="text"
              maxLength={70}
              value={activeSeo.metaTitle}
              onChange={(e) => onSeoChange(activeLocale, "metaTitle", e.target.value)}
              className={inputClass}
              placeholder="Shown as the page title in search results"
            />
          </div>
          <div>
            <label htmlFor={`seo-desc-${activeLocale}`} className={labelClass}>
              Meta description <span className="text-slate-500">(max 160 chars)</span>
            </label>
            <textarea
              id={`seo-desc-${activeLocale}`}
              maxLength={160}
              rows={2}
              value={activeSeo.metaDescription}
              onChange={(e) => onSeoChange(activeLocale, "metaDescription", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Shown as the snippet in search results"
            />
          </div>
          <div>
            <label htmlFor={`seo-keywords-${activeLocale}`} className={labelClass}>
              Keywords <span className="text-slate-500">(comma-separated)</span>
            </label>
            <input
              id={`seo-keywords-${activeLocale}`}
              type="text"
              value={activeSeo.keywords}
              onChange={(e) => onSeoChange(activeLocale, "keywords", e.target.value)}
              className={inputClass}
              placeholder="sofa, living room, furniture"
            />
          </div>
          <div>
            <label htmlFor={`seo-ogimage-${activeLocale}`} className={labelClass}>
              OG image URL <span className="text-slate-500">(optional override)</span>
            </label>
            <input
              id={`seo-ogimage-${activeLocale}`}
              type="text"
              value={activeSeo.ogImage}
              onChange={(e) => onSeoChange(activeLocale, "ogImage", e.target.value)}
              className={inputClass}
              placeholder="Defaults to the first product image if left blank"
            />
          </div>
          <div>
            <label htmlFor={`seo-canonical-${activeLocale}`} className={labelClass}>
              Canonical URL <span className="text-slate-500">(optional)</span>
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

        {/* Structured data — not locale-specific, shown once regardless of tab */}
        <div className="border-t border-slate-800 pt-3">
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
                placeholder="Barcode number"
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
                placeholder="Manufacturer part number"
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
        </div>

        <label className="flex cursor-pointer items-center gap-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={noIndex}
            onChange={(e) => onNoIndexChange(e.target.checked)}
            className="rounded border-slate-600"
          />
          Hide from search engines (noindex)
        </label>
    </div>
  );

  if (variant === "expanded") {
    return content;
  }

  return (
    <details className="group rounded-lg border border-slate-800 bg-slate-900/40">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-medium text-slate-200">
        SEO &amp; metadata
        <span className="text-slate-500 transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="space-y-4 border-t border-slate-800 px-3 py-3">{content}</div>
    </details>
  );
}