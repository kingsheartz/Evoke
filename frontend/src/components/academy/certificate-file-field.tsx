"use client";

import { useCallback, useRef, useState } from "react";
import { Link2 } from "lucide-react";
import { CertificatePreview } from "@/components/academy/certificate-preview";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
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
  const [uploading, setUploading] = useState(false);
  const [showUrlField, setShowUrlField] = useState(Boolean(value.trim()));

  const uploadFile = useCallback(
    async (file: File) => {
      if (!token) return;

      setUploading(true);
      try {
        const { data } = await apiClient.uploadCertificateFile(token, file);
        onChange(data.url);
        setShowUrlField(true);
        success("Certificate file uploaded");
      } catch (err) {
        notifyError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [token, onChange, success, notifyError],
  );

  usePasteMediaFile(containerRef, uploadFile, {
    enabled: Boolean(token),
    kind: "certificate",
  });

  const trimmed = value.trim();

  return (
    <div ref={containerRef} className={cn("space-y-3", className)}>
      <FileUploadZone
        accept={CERTIFICATE_FILE_ACCEPT}
        disabled={!token}
        uploading={uploading}
        hint={clipboardPasteHint("certificate")}
        emptyTitle="Upload certificate"
        emptyDescription="PDF, JPEG, PNG, or WebP."
        changeTitle="Replace certificate"
        previewKind="file"
        selectedFileName={trimmed ? trimmed.split("/").pop() ?? "Certificate file" : null}
        onFileSelect={uploadFile}
        onClear={trimmed ? () => onChange("") : undefined}
      />

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
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://... or upload certificate file"
            className="w-full"
          />
        )}
      </div>

      {trimmed ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-app-muted">Preview</p>
          <CertificatePreview url={trimmed} />
        </div>
      ) : null}
    </div>
  );
}
