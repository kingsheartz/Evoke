"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";
import { UPLOADABLE_IMAGE_ACCEPT } from "@/lib/media";
import { cn } from "@/lib/utils";

type MediaKind = "image" | "video";

interface MediaUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  kind?: MediaKind;
  placeholder?: string;
  id?: string;
  className?: string;
  showPreview?: boolean;
  /** Open crop editor before uploading images (default: true). */
  cropBeforeUpload?: boolean;
  /** Fixed crop aspect for images (e.g. 16/9). Omit for adjustable presets in the crop modal. */
  cropAspect?: number;
}

export function MediaUrlField({
  value,
  onChange,
  kind = "image",
  placeholder,
  id,
  className,
  showPreview = true,
  cropBeforeUpload = true,
  cropAspect,
}: MediaUrlFieldProps) {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { pendingCrop, startCrop, cancelCrop } = useImageCropFlow();

  const accept =
    kind === "video" ? "video/mp4,video/webm,video/quicktime,.mp4,.webm" : UPLOADABLE_IMAGE_ACCEPT;
  const defaultPlaceholder =
    kind === "video" ? "https://youtube.com/... or upload .mp4" : "https://... or upload image";

  const uploadFile = async (file: File) => {
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
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (kind === "image" && cropBeforeUpload && startCrop(file)) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    void uploadFile(file);
  };

  const trimmed = value.trim();
  const showImagePreview = showPreview && kind === "image" && trimmed.length > 0;
  const showVideoPreview = showPreview && kind === "video" && trimmed.length > 0 && /\.(mp4|webm|mov)(\?|$)/i.test(trimmed);

  return (
    <>
      <div className={cn("space-y-2", className)}>
        <p className="text-xs text-app-muted">
          Paste a URL or upload a file
          {kind === "image" ? " (JPEG, PNG, WebP, HEIC). Images can be cropped before upload." : "."}
        </p>
        <Input
          id={id}
          value={value}
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
            <img src={trimmed} alt="" className="aspect-video max-h-40 w-full object-cover" />
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
        aspect={cropAspect}
        title="Crop image"
        confirmLabel="Crop & upload"
        onClose={cancelCrop}
        onConfirm={uploadFile}
      />
    </>
  );
}
