"use client";

import { useCallback, useEffect, useState } from "react";
import { isCropSupportedImage } from "@/lib/media";

export interface PendingImageCrop {
  src: string;
  file: File;
  fileName: string;
  mimeType: string;
}

export function useImageCropFlow() {
  const [pending, setPending] = useState<PendingImageCrop | null>(null);

  const startCrop = useCallback((file: File): boolean => {
    if (!isCropSupportedImage(file)) {
      return false;
    }
    const src = URL.createObjectURL(file);
    setPending({
      src,
      file,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
    });
    return true;
  }, []);

  const cancelCrop = useCallback(() => {
    setPending((current) => {
      if (current?.src) URL.revokeObjectURL(current.src);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (pending?.src) URL.revokeObjectURL(pending.src);
    };
  }, [pending?.src]);

  return { pendingCrop: pending, startCrop, cancelCrop, clearCrop: cancelCrop };
}
