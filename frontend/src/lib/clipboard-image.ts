export type ClipboardMediaKind = "image" | "video" | "certificate";

/** Extract the first matching file from a paste event clipboard. */
export function fileFromClipboard(
  dataTransfer: DataTransfer | null | undefined,
  kind: ClipboardMediaKind = "image",
): File | null {
  if (!dataTransfer) return null;

  for (const item of dataTransfer.items) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (!file) continue;

    if (kind === "image" && file.type.startsWith("image/")) return file;
    if (kind === "video" && file.type.startsWith("video/")) return file;
    if (
      kind === "certificate" &&
      (file.type.startsWith("image/") || file.type === "application/pdf" || /\.pdf$/i.test(file.name))
    ) {
      return file;
    }
  }

  return null;
}

export function clipboardPasteHint(kind: ClipboardMediaKind = "image"): string {
  switch (kind) {
    case "video":
      return "Paste a URL or video file (Ctrl+V), or upload";
    case "certificate":
      return "Paste a URL or image/PDF (Ctrl+V), or upload";
    default:
      return "Paste a URL or image (Ctrl+V), or upload a file";
  }
}
