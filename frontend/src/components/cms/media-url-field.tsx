"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { usePasteMediaFile } from "@/hooks/use-paste-media-file";
import { clipboardPasteHint } from "@/lib/clipboard-image";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";
import { UPLOADABLE_IMAGE_ACCEPT } from "@/lib/media";
import { cn } from "@/lib/utils";

type MediaKind = "image" | "video";

interface MediaUrlFieldProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  kind?: MediaKind;
  placeholder?: string;
  id?: string;
  className?: string;
  showPreview?: boolean;
  /** How the image preview is cropped — use contain for portrait / logo assets. */
  previewFit?: "cover" | "contain";
  /** Open crop editor before uploading images (default: true). */
  cropBeforeUpload?: boolean;
  /** Fixed crop aspect for images (e.g. 16/9). Omit for adjustable presets in the crop modal. */
  cropAspect?: number;
  /** Allow Ctrl+V / Cmd+V image paste when this field is focused (default: true). */
  enablePaste?: boolean;
}

export function MediaUrlField({
  value,
  onChange,
  kind = "image",
  placeholder,
  id,
  className,
  showPreview = true,
  previewFit = "cover",
  cropBeforeUpload = true,
  cropAspect,
  enablePaste = true,
}: MediaUrlFieldProps) {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { pendingCrop, startCrop, cancelCrop } = useImageCropFlow();

  const accept =
    kind === "video" ? "video/mp4,video/webm,video/quicktime,.mp4,.webm" : UPLOADABLE_IMAGE_ACCEPT;
  const defaultPlaceholder =
    kind === "video" ? "https://youtube.com/... or upload .mp4" : "https://... or upload image";

  const uploadFile = useCallback(
    async (file: File) => {
      if (!token) return;

      setUploading(true);
      try {
        const { data } = await apiClient.uploadCmsMedia(token, file, kind);
        onChange(data.url);
        success(kind === "video" ? "Video uploaded" : "Image uploaded");
      } catch (err) {
        notifyError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [token, kind, onChange, success, notifyError],
  );

  const processIncomingFile = useCallback(
    (file: File) => {
      if (!token) return;

      if (kind === "image" && cropBeforeUpload && startCrop(file)) {
        if (fileRef.current) fileRef.current.value = "";
        return;
      }

      void uploadFile(file);
    },
    [token, kind, cropBeforeUpload, startCrop, uploadFile],
  );

  usePasteMediaFile(containerRef, processIncomingFile, {
    enabled: enablePaste && Boolean(token),
    kind: kind === "video" ? "video" : "image",
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processIncomingFile(file);
  };

  const trimmed = (value ?? "").trim();
  const showImagePreview = showPreview && kind === "image" && trimmed.length > 0;
  const showVideoPreview = showPreview && kind === "video" && trimmed.length > 0 && /\.(mp4|webm|mov)(\?|$)/i.test(trimmed);

  const pasteHint = clipboardPasteHint(kind === "video" ? "video" : "image");
  const cropHint =
    kind === "image"
      ? " (JPEG, PNG, WebP, HEIC). You can upload the original, use best fit, or custom crop."
      : ".";

  return (
    <>
      <div ref={containerRef} className={cn("space-y-2", className)}>
        <p className="text-xs text-app-muted">
          {pasteHint}
          {kind === "image" ? cropHint : "."}
        </p>
        <Input
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? defaultPlaceholder}
          className="w-full"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          disabled={uploading || !token}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />
        {showImagePreview && (
          <div className="overflow-hidden rounded-lg border border-app-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trimmed}
              alt=""
              className={cn(
                "max-h-40 w-full",
                previewFit === "contain"
                  ? "object-contain bg-app-surface-muted/40 py-2"
                  : "aspect-video object-cover",
              )}
            />
          </div>
        )}
        {showVideoPreview && (
          <div className="overflow-hidden rounded-lg border border-app-border">
            <video src={trimmed} controls className="aspect-video max-h-40 w-full bg-black object-contain" />
          </div>
        )}
      </div>

      <ImageCropModal
        open={Boolean(pendingCrop)}
        imageSrc={pendingCrop?.src ?? null}
        fileName={pendingCrop?.fileName ?? "image.jpg"}
        mimeType={pendingCrop?.mimeType ?? "image/jpeg"}
        originalFile={pendingCrop?.file}
        defaultAspect={cropAspect}
        title="Adjust image"
        confirmLabel="Custom crop & upload"
        onClose={cancelCrop}
        onConfirm={uploadFile}
      />
    </>
  );
}
