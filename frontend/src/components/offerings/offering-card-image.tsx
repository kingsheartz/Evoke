"use client";

import { useState } from "react";
import type { OfferingCardData } from "@/lib/offerings";
import { cn } from "@/lib/utils";

function fallbackImageUrl(vertical: OfferingCardData["vertical"], title: string): string {
  const seed = encodeURIComponent(`${vertical}-${title}`.toLowerCase().replace(/\s+/g, "-"));

  return `https://picsum.photos/seed/${seed}/900/675`;
}

export function OfferingCardImage({
  src,
  alt,
  title,
  vertical,
  className,
}: {
  src: string | null | undefined;
  alt?: string;
  title: string;
  vertical: OfferingCardData["vertical"];
  className?: string;
}) {
  const primary = src?.trim() || null;
  const [activeSrc, setActiveSrc] = useState(primary ?? fallbackImageUrl(vertical, title));

  if (!activeSrc) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 via-app-surface-muted/30 to-app-surface-muted/60">
        <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-app-muted/70">
          {vertical}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeSrc}
      alt={alt?.trim() || title}
      className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-105", className)}
      onError={() => {
        const fallback = fallbackImageUrl(vertical, title);
        if (activeSrc !== fallback) setActiveSrc(fallback);
      }}
    />
  );
}
