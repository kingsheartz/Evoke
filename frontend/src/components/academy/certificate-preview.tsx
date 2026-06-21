"use client";

import { isCertificatePdf } from "@/lib/media";
import { cn } from "@/lib/utils";

export function CertificatePreview({
  url,
  title = "Certificate preview",
  className,
  compact = false,
}: {
  url: string;
  title?: string;
  className?: string;
  /** Smaller preview for table thumbnails. */
  compact?: boolean;
}) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const heightClass = compact ? "h-28" : "h-72 md:h-96";

  if (isCertificatePdf(trimmed)) {
    return (
      <iframe
        src={trimmed}
        title={title}
        className={cn("w-full rounded-lg border border-app-border bg-white", heightClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-app-border bg-app-surface-muted/30",
        heightClass,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={trimmed} alt={title} className="h-full w-full object-contain" />
    </div>
  );
}
