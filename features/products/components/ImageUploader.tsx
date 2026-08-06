// features/products/components/ImageUploader.tsx
"use client";

import { memo, useRef } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB, MAX_IMAGES } from "../constants";
import { getImageUrl } from "../utils/r2Url";
import type { ImageFile } from "../types";

type ExistingImage = {
  key: string;
};

type ImageUploaderProps = {
  files: ImageFile[];
  onAddFiles: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  onMoveFile?: (index: number, direction: -1 | 1) => void;
  /**
   * How many more files can currently be added — computed by
   * useImageUploader, accounting for existing (non-removed) images too,
   * not just the staged new ones.
   */
  remaining: number;
  existingImages?: ExistingImage[];
  onRemoveExisting?: (key: string) => void;
  onMoveExisting?: (index: number, direction: -1 | 1) => void;
};

function OrderControls({
  index,
  total,
  label,
  onMove,
}: {
  index: number;
  total: number;
  label: string;
  onMove?: (index: number, direction: -1 | 1) => void;
}) {
  if (!onMove || total < 2) return null;

  return (
    <div className="absolute bottom-0.5 left-0.5 flex gap-0.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMove(index, -1);
        }}
        disabled={index === 0}
        className="rounded border border-slate-700 bg-slate-900/90 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
        aria-label={`Move ${label} left`}
      >
        <ArrowLeft className="h-2.5 w-2.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMove(index, 1);
        }}
        disabled={index === total - 1}
        className="rounded border border-slate-700 bg-slate-900/90 p-0.5 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
        aria-label={`Move ${label} right`}
      >
        <ArrowRight className="h-2.5 w-2.5" aria-hidden />
      </button>
    </div>
  );
}

function ImageUploaderComponent({
  files,
  onAddFiles,
  onRemoveFile,
  onMoveFile,
  remaining,
  existingImages = [],
  onRemoveExisting,
  onMoveExisting,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    onAddFiles(e.dataTransfer.files);
  }

  const totalCount = existingImages.length + files.length;

  return (
    <div className="space-y-2">
      {existingImages.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] text-slate-400">
            Current images · first is primary · use arrows to set order
          </p>
          <div className="flex flex-wrap gap-2">
            {existingImages.map(({ key }, index) => (
              <div key={key} className="relative">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                  <img
                    src={getImageUrl(key)}
                    alt="Product"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                  <span className="absolute left-0.5 top-0.5 rounded bg-slate-950/80 px-1 text-[9px] font-medium text-slate-200">
                    {index === 0 ? "1 · primary" : index + 1}
                  </span>
                  <OrderControls
                    index={index}
                    total={existingImages.length}
                    label={`image ${index + 1}`}
                    onMove={onMoveExisting}
                  />
                </div>
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(key)}
                    className="absolute -right-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-800 text-slate-300 ring-1 ring-slate-700 hover:bg-red-900 hover:text-white transition-colors"
                    aria-label="Remove this image"
                  >
                    <X className="h-2.5 w-2.5" aria-hidden />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => remaining > 0 && inputRef.current?.click()}
        className={[
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
          remaining > 0
            ? "cursor-pointer border-slate-700 hover:border-slate-500 hover:bg-slate-900/60"
            : "cursor-not-allowed border-slate-800 opacity-50",
        ].join(" ")}
        role="button"
        tabIndex={remaining > 0 ? 0 : -1}
        aria-label="Upload product images"
        onKeyDown={(e) => e.key === "Enter" && remaining > 0 && inputRef.current?.click()}
      >
        <ImagePlus className="h-7 w-7 text-slate-500" aria-hidden />
        <div>
          <p className="text-xs font-medium text-slate-300">
            {remaining > 0
              ? `Click or drag to upload (${totalCount}/${MAX_IMAGES})`
              : `Maximum ${MAX_IMAGES} images reached`}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {ALLOWED_IMAGE_TYPES_LABEL} · Max {MAX_FILE_SIZE_MB} MB each
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={(e) => onAddFiles(e.target.files)}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
      />

      {files.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] text-slate-400">
            New uploads · appended after current images in this order
          </p>
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative">
                {f.error ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-red-800 bg-red-950/40 p-1">
                    <p className="text-center text-[9px] leading-tight text-red-400">{f.error}</p>
                  </div>
                ) : (
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                    <img src={f.preview} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                    <span className="absolute left-0.5 top-0.5 rounded bg-slate-950/80 px-1 text-[9px] font-medium text-slate-200">
                      {existingImages.length + i + 1}
                    </span>
                    <OrderControls
                      index={i}
                      total={files.length}
                      label={`new image ${i + 1}`}
                      onMove={onMoveFile}
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(i);
                  }}
                  className="absolute -right-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-800 text-slate-300 ring-1 ring-slate-700 hover:bg-red-900 hover:text-white transition-colors"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X className="h-2.5 w-2.5" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const ImageUploader = memo(ImageUploaderComponent);
