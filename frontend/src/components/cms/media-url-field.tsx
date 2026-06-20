"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";
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
}

export function MediaUrlField({
  value,
  onChange,
  kind = "image",
  placeholder,
  id,
  className,
  showPreview = true,
}: MediaUrlFieldProps) {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const accept = kind === "video" ? "video/mp4,video/webm,video/quicktime,.mp4,.webm" : "image/*";
  const defaultPlaceholder =
    kind === "video" ? "https://youtube.com/... or upload .mp4" : "https://... or upload image";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

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

  const trimmed = value.trim();
  const showImagePreview = showPreview && kind === "image" && trimmed.length > 0;
  const showVideoPreview = showPreview && kind === "video" && trimmed.length > 0 && /\.(mp4|webm|mov)(\?|$)/i.test(trimmed);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? defaultPlaceholder}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={uploading || !token}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      <p className="text-xs text-app-muted">Paste a URL or upload a file.</p>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={(e) => void handleUpload(e)} />
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
  );
}
