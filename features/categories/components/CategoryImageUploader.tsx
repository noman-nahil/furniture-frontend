// features/categories/components/CategoryImageUploader.tsx

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { getImageUrl } from "@/lib/image";
import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB } from "@/lib/uploadConstraints";
import type { StagedImage } from "../hooks/useCategoryImageUploader";

type CategoryImageUploaderProps = {
  staged: StagedImage | null;
  removeExisting: boolean;
  existingImage?: string;
  onFile: (files: FileList | null) => void;
  onClearStaged: () => void;
  onMarkRemoveExisting: () => void;
  onUndoRemoveExisting: () => void;
};

export function CategoryImageUploader({
  staged,
  removeExisting,
  existingImage,
  onFile,
  onClearStaged,
  onMarkRemoveExisting,
  onUndoRemoveExisting,
}: CategoryImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    onFile(e.dataTransfer.files);
  }

  const previewSrc = !removeExisting
    ? staged?.preview || (existingImage ? getImageUrl(existingImage) : null)
    : null;

  return (
    <div className="space-y-2">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload category image"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={[
          "relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          removeExisting
            ? "border-red-800/60 bg-red-950/20"
            : "border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-900/60",
        ].join(" ")}
      >
        {previewSrc ? (
          <img src={previewSrc} alt="Category" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            {removeExisting ? (
              <span className="text-[10px] font-medium text-red-300">Image will be removed</span>
            ) : (
              <>
                <ImagePlus className="h-5 w-5 text-slate-500" aria-hidden />
                <span className="text-[10px] text-slate-500">Click or drag</span>
              </>
            )}
          </div>
        )}

        {/* Clears a newly staged file, reverting to the existing saved image. */}
        {staged?.preview && !removeExisting && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearStaged();
            }}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-slate-300 ring-1 ring-slate-700 transition-colors hover:bg-red-900 hover:text-white"
            aria-label="Cancel new image"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        )}
      </div>

      {staged?.error && <p className="text-[11px] text-red-400">{staged.error}</p>}

      <p className="text-[10px] text-slate-500">
        {ALLOWED_IMAGE_TYPES_LABEL} · Max {MAX_FILE_SIZE_MB} MB
      </p>

      {/* Explicit "delete, don't replace" action — only shown when there's
          an actual saved image to remove and no new file is currently staged. */}
      {existingImage && !staged && (
        <button
          type="button"
          onClick={removeExisting ? onUndoRemoveExisting : onMarkRemoveExisting}
          className={
            removeExisting
              ? "text-[11px] font-medium text-slate-300 hover:text-white"
              : "text-[11px] font-medium text-red-400 hover:text-red-300"
          }
        >
          {removeExisting ? "Undo remove" : "Remove image"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => onFile(e.target.files)}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
      />
    </div>
  );
}