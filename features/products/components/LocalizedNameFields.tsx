// features/products/components/LocalizedNameFields.tsx
"use client";

type LocalizedNameFieldsProps = {
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  onNameChange: (locale: "fr" | "en", value: string) => void;
  onDescriptionChange: (locale: "fr" | "en", value: string) => void;
  layout?: "stack" | "grid";
};

const fieldClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none placeholder-slate-500 focus:ring-1 focus:ring-slate-300";

export function LocalizedNameFields({
  name,
  description,
  onNameChange,
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