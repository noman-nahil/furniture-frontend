// features/products/hooks/useImageUploader.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_TYPES_LABEL,
  MAX_FILE_SIZE_MB,
  MAX_IMAGES,
} from "../constants";
import type { ImageFile } from "../types";

/**
 * existingCount: how many images already exist on the product (in edit
 * mode) that AREN'T marked for removal. The cap on new uploads has to
 * account for these too, or an edit could stage new files that push the
 * total past MAX_IMAGES without any client-side warning until the
 * server rejects it.
 */
export function useImageUploader(existingCount: number = 0) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const urlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addFiles = useCallback(
    (raw: FileList | null) => {
      if (!raw || raw.length === 0) return;

      const incoming: ImageFile[] = Array.from(raw).map((file) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return {
            file,
            preview: "",
            error: `${file.name}: only ${ALLOWED_IMAGE_TYPES_LABEL} are allowed.`,
          };
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          return {
            file,
            preview: "",
            error: `${file.name}: must be under ${MAX_FILE_SIZE_MB} MB.`,
          };
        }
        const preview = URL.createObjectURL(file);
        urlsRef.current.add(preview);
        return { file, preview };
      });

      setFiles((prev) => {
        const capacity = Math.max(0, MAX_IMAGES - existingCount);
        return [...prev, ...incoming].slice(0, capacity);
      });
    },
    [existingCount],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const target = prev[index];
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
        urlsRef.current.delete(target.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const moveFile = useCallback((index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  // Stable reset — do not close over `files`, or every upload/keystroke
  // parent re-render recreates reset → resetForm → modal onClose.
  const reset = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      urlsRef.current.clear();
      return [];
    });
  }, []);

  const hasErrors = files.some((f) => f.error);
  const remaining = Math.max(0, MAX_IMAGES - existingCount - files.length);

  return useMemo(
    () => ({ files, addFiles, removeFile, moveFile, reset, hasErrors, remaining }),
    [files, addFiles, removeFile, moveFile, reset, hasErrors, remaining],
  );
}
