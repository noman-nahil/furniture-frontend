// features/products/components/LocalizedNameFields.tsx
"use client";

import { useState } from "react";

type LocalizedNameFieldsProps = {
  name: { fr: string; en: string };
  slug: { fr: string; en: string };
  description: { fr: string; en: string };
  onNameChange: (locale: "fr" | "en", value: string) => void;
  onSlugChange: (locale: "fr" | "en", value: string) => void;
  onSlugBlur: (locale: "fr" | "en") => void;
  onSlugFromName: (locale: "fr" | "en") => void;
  onDescriptionChange: (locale: "fr" | "en", value: string) => void;
  layout?: "stack" | "grid";
};

const fieldClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none placeholder-slate-500 focus:ring-1 focus:ring-slate-300";

const slugFieldClass = `${fieldClass} font-mono text-xs`;

export function LocalizedNameFields({
  name,
  slug,
  description,
  onNameChange,
  onSlugChange,
  onSlugBlur,
  onSlugFromName,
  onDescriptionChange,
  layout = "stack",
}: LocalizedNameFieldsProps) {
  const [activeLocale, setActiveLocale] = useState<"fr" | "en">("fr");
  const isFrench = activeLocale === "fr";

  return (
    <div className="space-y-3">
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

      <div className={layout === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "space-y-3"}>
        <div>
          <label htmlFor={`product-name-${activeLocale}`} className="mb-1 block text-xs font-medium text-slate-200">
            Name{" "}
            <span className="text-slate-500">{isFrench ? "— required" : "— optional"}</span>
          </label>
          <input
            id={`product-name-${activeLocale}`}
            type="text"
            value={name[activeLocale]}
            onChange={(e) => onNameChange(activeLocale, e.target.value)}
            className={fieldClass}
            placeholder={isFrench ? "Nom du produit" : "Product name"}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label htmlFor={`product-slug-${activeLocale}`} className="block text-xs font-medium text-slate-200">
              Slug {isFrench ? null : <span className="text-slate-500">— optional</span>}
            </label>
            <button
              type="button"
              onClick={() => onSlugFromName(activeLocale)}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-200"
            >
              Use name
            </button>
          </div>
          <input
            id={`product-slug-${activeLocale}`}
            type="text"
            value={slug[activeLocale]}
            onChange={(e) => onSlugChange(activeLocale, e.target.value)}
            onBlur={() => onSlugBlur(activeLocale)}
            className={slugFieldClass}
            placeholder={isFrench ? "nom-du-produit" : "product-name"}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`product-desc-${activeLocale}`} className="mb-1 block text-xs font-medium text-slate-200">
          Description <span className="text-slate-500">— optional</span>
        </label>
        <textarea
          id={`product-desc-${activeLocale}`}
          value={description[activeLocale]}
          onChange={(e) => onDescriptionChange(activeLocale, e.target.value)}
          rows={layout === "grid" ? 8 : 6}
          className={`${fieldClass} min-h-[10rem] resize-y`}
          placeholder={isFrench ? "Description en français" : "Description in English"}
        />
      </div>
    </div>
  );
}
