// features/products/components/LocalizedNameFields.tsx
"use client";

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
  const gridClass = layout === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "space-y-3";

  return (
    <div className={gridClass}>
      <div>
        <label htmlFor="product-name-fr" className="mb-1 block text-xs font-medium text-slate-200">
          Name (French) <span className="text-slate-500">— required</span>
        </label>
        <input
          id="product-name-fr"
          type="text"
          value={name.fr}
          onChange={(e) => onNameChange("fr", e.target.value)}
          className={fieldClass}
          placeholder="Nom du produit"
        />
      </div>
      <div>
        <label htmlFor="product-name-en" className="mb-1 block text-xs font-medium text-slate-200">
          Name (English) <span className="text-slate-500">— optional</span>
        </label>
        <input
          id="product-name-en"
          type="text"
          value={name.en}
          onChange={(e) => onNameChange("en", e.target.value)}
          className={fieldClass}
          placeholder="Product name"
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label htmlFor="product-slug-fr" className="block text-xs font-medium text-slate-200">
            Slug (French)
          </label>
          <button
            type="button"
            onClick={() => onSlugFromName("fr")}
            className="text-[10px] font-medium text-slate-400 hover:text-slate-200"
          >
            Use name
          </button>
        </div>
        <input
          id="product-slug-fr"
          type="text"
          value={slug.fr}
          onChange={(e) => onSlugChange("fr", e.target.value)}
          onBlur={() => onSlugBlur("fr")}
          className={slugFieldClass}
          placeholder="nom-du-produit"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="mt-1 text-[10px] text-slate-500">
          Updates as you type the name. You can also edit it.
        </p>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label htmlFor="product-slug-en" className="block text-xs font-medium text-slate-200">
            Slug (English) <span className="text-slate-500">— optional</span>
          </label>
          <button
            type="button"
            onClick={() => onSlugFromName("en")}
            className="text-[10px] font-medium text-slate-400 hover:text-slate-200"
          >
            Use name
          </button>
        </div>
        <input
          id="product-slug-en"
          type="text"
          value={slug.en}
          onChange={(e) => onSlugChange("en", e.target.value)}
          onBlur={() => onSlugBlur("en")}
          className={slugFieldClass}
          placeholder="product-name"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div>
        <label htmlFor="product-desc-fr" className="mb-1 block text-xs font-medium text-slate-200">
          Description (French) <span className="text-slate-500">— optional</span>
        </label>
        <textarea
          id="product-desc-fr"
          value={description.fr}
          onChange={(e) => onDescriptionChange("fr", e.target.value)}
          rows={3}
          className={`${fieldClass} resize-none`}
          placeholder="Description en français"
        />
      </div>
      <div>
        <label htmlFor="product-desc-en" className="mb-1 block text-xs font-medium text-slate-200">
          Description (English) <span className="text-slate-500">— optional</span>
        </label>
        <textarea
          id="product-desc-en"
          value={description.en}
          onChange={(e) => onDescriptionChange("en", e.target.value)}
          rows={3}
          className={`${fieldClass} resize-none`}
          placeholder="Description in English"
        />
      </div>
    </div>
  );
}
