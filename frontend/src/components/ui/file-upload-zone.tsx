"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { CloudUpload, FileImage, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploadZoneProps = {
  accept?: string;
  disabled?: boolean;
  uploading?: boolean;
  hint?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  changeTitle?: string;
  previewUrl?: string | null;
  previewKind?: "image" | "file";
  selectedFileName?: string | null;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  className?: string;
  compact?: boolean;
  /** For native HTML forms — forwards name/required to the hidden file input. */
  name?: string;
  required?: boolean;
  footer?: ReactNode;
};

export function FileUploadZone({
  accept,
  disabled,
  uploading,
  hint,
  emptyTitle = "Click to upload or drag & drop",
  emptyDescription,
  changeTitle = "Change file",
  previewUrl,
  previewKind = "image",
  selectedFileName,
  onFileSelect,
  onClear,
  className,
  compact,
  name,
  required,
  footer,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localFileName, setLocalFileName] = useState<string | null>(null);

  const displayName = selectedFileName ?? localFileName;
  const hasPreview = Boolean(previewUrl) || Boolean(displayName);
  const busy = Boolean(disabled || uploading);

  const openPicker = useCallback(() => {
    if (!busy) inputRef.current?.click();
  }, [busy]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setLocalFileName(file.name);
      onFileSelect(file);
    },
    [onFileSelect],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        aria-disabled={busy}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (busy) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragOver(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragOver(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (busy) return;
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "file-upload-zone group relative overflow-hidden rounded-xl border-2 border-dashed transition-all",
          compact ? "min-h-[7.5rem] px-4 py-5" : "min-h-[9.5rem] px-6 py-8",
          dragOver
            ? "border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(93,93,255,0.25)]"
            : "border-app-border bg-app-surface-muted/25 hover:border-accent/35 hover:bg-accent/[0.04]",
          busy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        )}
      >
        {previewUrl && previewKind === "image" ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20" />
            <div className="relative z-10 flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 text-center">
              <FileImage className="h-7 w-7 text-white/90" />
              <p className="text-sm font-medium text-white">{uploading ? "Uploading…" : changeTitle}</p>
              {hint ? <p className="max-w-xs text-xs text-white/70">{hint}</p> : null}
            </div>
          </>
        ) : hasPreview ? (
          <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/25">
              <FileText className="h-6 w-6 text-accent-soft" />
            </div>
            <p className="text-sm font-medium text-app-text">{displayName}</p>
            <p className="text-xs text-app-muted">{uploading ? "Uploading…" : changeTitle}</p>
          </div>
        ) : (
          <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/25 transition-transform group-hover:scale-105">
              <CloudUpload className="h-6 w-6 text-accent-soft" />
            </div>
            <p className="text-sm font-medium text-app-text">{uploading ? "Uploading…" : emptyTitle}</p>
            {emptyDescription ? (
              <p className="max-w-sm text-xs leading-relaxed text-app-muted">{emptyDescription}</p>
            ) : hint ? (
              <p className="max-w-sm text-xs leading-relaxed text-app-muted">{hint}</p>
            ) : null}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          name={name}
          required={required}
          accept={accept}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            handleFiles(event.target.files);
            if (!name) event.target.value = "";
          }}
        />
      </div>

      {(displayName || onClear) && (
        <div className="flex items-center justify-between gap-3">
          {displayName ? (
            <p className="min-w-0 truncate text-xs text-app-muted">{displayName}</p>
          ) : (
            <span />
          )}
          {onClear && previewUrl ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-status-error hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : null}
        </div>
      )}

      {footer}
    </div>
  );
}
