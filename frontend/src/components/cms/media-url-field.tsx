"use client";

import { useCallback, useRef, useState } from "react";
import { Link2 } from "lucide-react";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { Input } from "@/components/ui/input";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { usePasteMediaFile } from "@/hooks/use-paste-media-file";
import { clipboardPasteHint } from "@/lib/clipboard-image";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";
import { UPLOADABLE_IMAGE_ACCEPT, resolvePublicMediaUrl } from "@/lib/media";
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
  previewFit?: "cover" | "contain";
  cropBeforeUpload?: boolean;
  cropAspect?: number;
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
  const [uploading, setUploading] = useState(false);
  const [showUrlField, setShowUrlField] = useState(Boolean((value ?? "").trim() && !uploading));
  const { pendingCrop, startCrop, cancelCrop } = useImageCropFlow();

  const accept =
    kind === "video" ? "video/mp4,video/webm,video/quicktime,.mp4,.webm" : UPLOADABLE_IMAGE_ACCEPT;
  const defaultPlaceholder =
    kind === "video" ? "https://youtube.com/... or upload .mp4" : "https://... or paste image URL";

  const uploadFile = useCallback(
    async (file: File) => {
      if (!token) return;

      setUploading(true);
      try {
        const { data } = await apiClient.uploadCmsMedia(token, file, kind);
        onChange(data.url);
        setShowUrlField(true);
        success(kind === "video" ? "Video uploaded" : "Image uploaded");
      } catch (err) {
        notifyError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [token, kind, onChange, success, notifyError],
  );

  const processIncomingFile = useCallback(
    (file: File) => {
      if (!token) return;

      if (kind === "image" && cropBeforeUpload && startCrop(file)) {
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

  const trimmed = (value ?? "").trim();
  const previewSrc = showPreview ? resolvePublicMediaUrl(trimmed) : "";
  const showImagePreview = kind === "image" && previewSrc.length > 0;
  const showVideoPreview =
    kind === "video" && previewSrc.length > 0 && /\.(mp4|webm|mov)(\?|$)/i.test(previewSrc);

  const pasteHint = clipboardPasteHint(kind === "video" ? "video" : "image");
  const uploadHint =
    kind === "image"
      ? "JPEG, PNG, WebP, or HEIC. Paste from clipboard when focused."
      : "MP4 or WebM recommended.";

  return (
    <>
      <div ref={containerRef} className={cn("space-y-3", className)}>
        <FileUploadZone
          accept={accept}
          disabled={!token}
          uploading={uploading}
          hint={pasteHint}
          emptyTitle={kind === "video" ? "Upload video" : "Upload photo"}
          emptyDescription={uploadHint}
          changeTitle={kind === "video" ? "Replace video" : "Replace photo"}
          previewUrl={showImagePreview ? previewSrc : null}
          previewKind="image"
          onFileSelect={processIncomingFile}
          onClear={trimmed ? () => onChange("") : undefined}
        />

        {showVideoPreview && (
          <div className="overflow-hidden rounded-xl border border-app-border">
            <video src={previewSrc} controls className="aspect-video max-h-48 w-full bg-black object-contain" />
          </div>
        )}

        {showImagePreview && previewFit === "contain" && (
          <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface-muted/40 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="" className="mx-auto max-h-40 object-contain" />
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowUrlField((open) => !open)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-app-muted transition-colors hover:text-accent-soft"
          >
            <Link2 className="h-3.5 w-3.5" />
            {showUrlField ? "Hide URL field" : "Paste URL instead"}
          </button>
          {showUrlField && (
            <Input
              id={id}
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder ?? defaultPlaceholder}
              className="w-full"
            />
          )}
        </div>
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
