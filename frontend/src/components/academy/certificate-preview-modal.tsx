"use client";

import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";
import { CertificatePreview } from "@/components/academy/certificate-preview";
import { Button } from "@/components/ui/button";

export function CertificatePreviewModal({
  open,
  url,
  title,
  onClose,
}: {
  open: boolean;
  url: string | null;
  title?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !url?.trim()) return null;

  const label = title ?? "Certificate";

  return (
    <div
      className="fixed inset-0 z-[2147483640] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-xl border border-app-border bg-app-surface p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="truncate text-sm font-semibold text-app-text">{label}</h2>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        <CertificatePreview url={url} title={label} />
      </div>
    </div>
  );
}
