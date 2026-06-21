"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { CertificatePreview } from "@/components/academy/certificate-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePasteMediaFile } from "@/hooks/use-paste-media-file";
import { clipboardPasteHint } from "@/lib/clipboard-image";
import { apiClient } from "@/lib/api";
import { CERTIFICATE_FILE_ACCEPT } from "@/lib/media";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

export function CertificateFileField({
  value,
  onChange,
  id,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}) {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!token) return;

      setUploading(true);
      try {
        const { data } = await apiClient.uploadCertificateFile(token, file);
        onChange(data.url);
        success("Certificate file uploaded");
      } catch (err) {
        notifyError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [token, onChange, success, notifyError],
  );

  usePasteMediaFile(containerRef, uploadFile, {
    enabled: Boolean(token),
    kind: "certificate",
  });

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void uploadFile(file);
  };

  const trimmed = value.trim();

  return (
    <div ref={containerRef} className={cn("space-y-2", className)}>
      <p className="text-xs text-app-muted">{clipboardPasteHint("certificate")} (PDF, JPEG, PNG, WebP).</p>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://... or upload certificate file"
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
        {uploading ? "Uploading…" : "Upload certificate"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept={CERTIFICATE_FILE_ACCEPT}
        className="hidden"
        onChange={handleUpload}
      />
      {trimmed ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-app-muted">Preview</p>
          <CertificatePreview url={trimmed} />
        </div>
      ) : null}
    </div>
  );
}
