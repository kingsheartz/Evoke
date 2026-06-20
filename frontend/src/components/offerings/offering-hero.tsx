"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { GalleryView } from "@/components/cms/gallery-view";
import type { GalleryImage } from "@/lib/cms-sections";
import type { OfferingVertical } from "@/lib/offerings";
import { cn } from "@/lib/utils";

const verticalPlaceholder: Record<OfferingVertical, string> = {
  tours: "Tour package",
  shop: "Product",
  academy: "Course",
};

export function OfferingHero({
  title,
  vertical,
  heroImageUrl,
  galleryImages,
  className,
}: {
  title: string;
  vertical: OfferingVertical;
  heroImageUrl?: string | null;
  galleryImages: GalleryImage[];
  className?: string;
}) {
  const [showGallery, setShowGallery] = useState(false);
  const validGallery = galleryImages.filter((image) => image.url?.trim());
  const imageUrl = heroImageUrl ?? validGallery[0]?.url ?? null;

  return (
    <>
      <div className={cn("relative aspect-[21/9] min-h-[240px] overflow-hidden bg-app-surface-muted/40", className)}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/15 via-app-surface-muted/30 to-app-surface-muted/60">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-app-muted/70">
              {verticalPlaceholder[vertical]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-app-bg/20 to-transparent" />

        {validGallery.length > 1 && (
          <button
            type="button"
            onClick={() => setShowGallery(true)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <Images className="h-4 w-4" />
            View all {validGallery.length} photos
          </button>
        )}
      </div>

      {showGallery && validGallery.length > 0 && (
        <div className="border-b border-app-border bg-app-surface/40 py-8">
          <div className="page-container mx-auto w-full max-w-7xl px-4 sm:px-6">
            <GalleryView images={validGallery} columns={3} previewLimit={validGallery.length} />
            <button
              type="button"
              className="mt-6 text-sm font-medium text-app-muted hover:text-accent-soft"
              onClick={() => setShowGallery(false)}
            >
              Hide gallery
            </button>
          </div>
        </div>
      )}
    </>
  );
}
