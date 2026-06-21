"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteAdUnit } from "@/components/site/site-ad-unit";
import { adsForPlacement } from "@/hooks/use-site-ads";
import { readDismissedAdIds } from "@/lib/ad-placements";
import type { Advertisement } from "@/lib/api";
import { cn } from "@/lib/utils";

function useVisibleAds(ads: Advertisement[]): Advertisement[] {
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissedAdIds());

  useEffect(() => {
    const refresh = () => setDismissed(readDismissedAdIds());
    window.addEventListener("storage", refresh);
    window.addEventListener("evoke-ad-dismissed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("evoke-ad-dismissed", refresh);
    };
  }, []);

  return ads.filter((ad) => !dismissed.has(ad.id));
}

interface SiteAdCarouselProps {
  ads: Advertisement[];
  variant: "strip" | "inline";
  className?: string;
  rotateMs?: number;
  showDots?: boolean;
}

export function SiteAdCarousel({ ads, variant, className, rotateMs = 8000, showDots = true }: SiteAdCarouselProps) {
  const visible = useVisibleAds(ads);
  const [index, setIndex] = useState(0);

  const goNext = useCallback(() => {
    setIndex((i) => (visible.length <= 1 ? 0 : (i + 1) % visible.length));
  }, [visible.length]);

  useEffect(() => {
    setIndex(0);
  }, [visible.length, visible.map((a) => a.id).join(",")]);

  useEffect(() => {
    if (visible.length <= 1) return;
    const timer = window.setInterval(goNext, rotateMs);
    return () => window.clearInterval(timer);
  }, [visible.length, goNext, rotateMs]);

  if (visible.length === 0) return null;

  const current = visible[Math.min(index, visible.length - 1)];

  if (visible.length === 1) {
    return (
      <div className={cn(variant === "strip" && "h-9 overflow-hidden", className)}>
        <SiteAdUnit ad={current} variant={variant} />
      </div>
    );
  }

  return (
    <div className={cn("relative", variant === "strip" && "h-9 overflow-hidden", className)}>
      {visible.map((ad, i) => (
        <div
          key={ad.id}
          className={cn(
            "transition-opacity duration-500",
            i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <SiteAdUnit ad={ad} variant={variant} onDismiss={goNext} />
        </div>
      ))}
      {showDots && visible.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
        {visible.map((ad, i) => (
          <button
            key={ad.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-4 bg-accent" : "w-1.5 bg-app-border hover:bg-app-muted",
            )}
            aria-label={`Show ad ${i + 1} of ${visible.length}`}
          />
        ))}
        </div>
      )}
    </div>
  );
}
