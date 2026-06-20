"use client";

import { SiteAdCarousel } from "@/components/site/site-ad-carousel";
import { useSiteAds, adsForPlacement } from "@/hooks/use-site-ads";

export function SiteAdTopStrip() {
  const ads = useSiteAds();
  const stripAds = adsForPlacement(ads, "top_strip");

  if (stripAds.length === 0) return null;

  return (
    <div className="relative z-40 border-b border-app-border/70 bg-app-surface/95 backdrop-blur-md">
      <div className="app-shell-x py-1.5">
        <SiteAdCarousel ads={stripAds} variant="strip" rotateMs={7000} showDots={false} />
      </div>
    </div>
  );
}
