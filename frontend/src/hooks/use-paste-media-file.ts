"use client";

import { useEffect, type RefObject } from "react";
import { fileFromClipboard, type ClipboardMediaKind } from "@/lib/clipboard-image";

/**
 * When focus is inside `containerRef`, intercept clipboard file paste (image/video/PDF)
 * and route to `onFile`. Text URL pastes are left to the focused input.
 */
export function usePasteMediaFile(
  containerRef: RefObject<HTMLElement | null>,
  onFile: (file: File) => void,
  options?: { enabled?: boolean; kind?: ClipboardMediaKind },
) {
  const enabled = options?.enabled !== false;
  const kind = options?.kind ?? "image";

  useEffect(() => {
    if (!enabled) return;

    const onPaste = (event: ClipboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const active = document.activeElement;
      if (!active || !container.contains(active)) return;

      const file = fileFromClipboard(event.clipboardData, kind);
      if (!file) return;

      event.preventDefault();
      onFile(file);
    };

    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [containerRef, onFile, enabled, kind]);
}
