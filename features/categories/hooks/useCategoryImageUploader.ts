// features/categories/hooks/useCategoryImageUploader.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_TYPES_LABEL, MAX_FILE_SIZE_MB } from "@/lib/uploadConstraints";

export type StagedImage = {
  file: File;
  preview: string;
  error?: string;
};

export function useCategoryImageUploader() {
  const [staged, setStaged] = useState<StagedImage | null>(null);
  // Explicit "delete the existing image, don't replace it" intent —
  // separate from `staged`, since picking a new file and removing the
  // existing one without replacing it are mutually exclusive actions.
  const [removeExisting, setRemoveExisting] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const setFile = useCallback((fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    // Picking a new file supersedes any pending "remove" request.
    setRemoveExisting(false);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setStaged({ file, preview: "", error: `Only ${ALLOWED_IMAGE_TYPES_LABEL} are allowed.` });
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setStaged({ file, preview: "", error: `Must be under ${MAX_FILE_SIZE_MB} MB.` });
      return;
    }

    const preview = URL.createObjectURL(file);
    urlRef.current = preview;
    setStaged({ file, preview });
  }, []);

  const clear = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setStaged(null);
    setRemoveExisting(false);
  }, []);

  const markRemoveExisting = useCallback(() => {
    // Removing supersedes any staged new file too.
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setStaged(null);
    setRemoveExisting(true);
  }, []);

  const undoRemoveExisting = useCallback(() => {
    setRemoveExisting(false);
  }, []);

  return {
    staged,
    removeExisting,
    setFile,
    clear,
    markRemoveExisting,
    undoRemoveExisting,
    hasError: !!staged?.error,
  };
}