"use client";

import { useCallback, useEffect, useState } from "react";
import type { HeroSlideshowSettings } from "@/lib/cms-sections";
import { cn } from "@/lib/utils";

interface CmsHeroBackgroundProps {
  images: string[];
  settings: HeroSlideshowSettings;
  className?: string;
}

export function CmsHeroBackground({ images, settings, className }: CmsHeroBackgroundProps) {
  const [index, setIndex] = useState(0);
  const durationMs = Math.max(3, settings.duration_seconds ?? 6) * 1000;
  const transition = settings.transition ?? "fade";
  const autoplay = settings.autoplay !== false;
  const showIndicators = settings.show_indicators !== false;

  const goNext = useCallback(() => {
    setIndex((current) => (images.length <= 1 ? 0 : (current + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    setIndex(0);
  }, [images.join("|")]);

  useEffect(() => {
    if (!autoplay || images.length <= 1) return;
    const timer = window.setInterval(goNext, durationMs);
    return () => window.clearInterval(timer);
  }, [autoplay, durationMs, goNext, images.length]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={images[0]} alt="" className={cn("absolute inset-0 h-full w-full object-cover", className)} />
    );
  }

  return (
    <>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            transition === "fade" && "transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
            className,
          )}
          aria-hidden={i !== index}
        />
      ))}

      {showIndicators && (
        <div
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-8"
          aria-label="Hero slideshow position"
        >
          {images.map((src, i) => (
            <button
              key={`${src}-dot-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70",
              )}
              aria-label={`Show slide ${i + 1} of ${images.length}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}
