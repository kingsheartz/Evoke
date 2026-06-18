"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Grid3X3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/cms-sections";

type GalleryViewProps = {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  previewLimit?: number;
  className?: string;
};

export function GalleryView({ images, columns = 3, previewLimit = 6, className }: GalleryViewProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const valid = images.filter((img) => img.url?.trim());
  const limit = Math.max(1, previewLimit);
  const hasMore = valid.length > limit;
  const visible = hasMore ? valid.slice(0, limit) : valid;

  const gridClass =
    columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <div className={cn("grid gap-4", gridClass, className)}>
        {visible.map((image, index) => (
          <GalleryTile key={`${image.url}-${index}`} image={image} onClick={() => setLightboxIndex(index)} />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-surface-muted/50 px-4 py-2.5 text-sm font-medium text-app-text transition hover:border-accent/30 hover:text-accent-soft"
        >
          <Grid3X3 className="h-4 w-4" />
          View all {valid.length} photos
        </button>
      )}
      {expanded && (
        <GalleryModal images={valid} onClose={() => setExpanded(false)} onSelect={setLightboxIndex} />
      )}
      {lightboxIndex !== null && (
        <Lightbox
          images={valid}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}

function GalleryTile({ image, onClick }: { image: GalleryImage; onClick: () => void }) {
  return (
    <figure className="group overflow-hidden rounded-xl border border-app-border bg-app-surface-muted/40">
      <button type="button" onClick={onClick} className="relative block aspect-[4/3] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt?.trim() || "Gallery image"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </button>
      {image.caption?.trim() && (
        <figcaption className="px-4 py-3 text-sm text-app-muted">{image.caption}</figcaption>
      )}
    </figure>
  );
}

function GalleryModal({
  images,
  onClose,
  onSelect,
}: {
  images: GalleryImage[];
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/80 p-4 md:p-8" role="dialog" aria-modal="true">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Gallery ({images.length} photos)</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Close gallery"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className="group overflow-hidden rounded-lg ring-1 ring-white/10 transition hover:ring-accent/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt?.trim() || "Gallery image"}
              className="aspect-square w-full object-cover transition group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const image = images[index];
  const prev = () => onNavigate(index > 0 ? index - 1 : images.length - 1);
  const next = () => onNavigate(index < images.length - 1 ? index + 1 : 0);

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4" onClick={onClose} role="dialog">
      <button
        type="button"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <figure className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.alt?.trim() || "Gallery image"}
          className="max-h-[75vh] w-auto rounded-lg object-contain"
        />
        {image.caption?.trim() && (
          <figcaption className="mt-3 text-center text-sm text-white/80">{image.caption}</figcaption>
        )}
        <p className="mt-2 text-center text-xs text-white/50">
          {index + 1} / {images.length}
        </p>
      </figure>
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <button
        type="button"
        className="absolute right-4 top-4 rounded-lg p-2 text-white/80 hover:bg-white/10"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>,
    document.body,
  );
}
