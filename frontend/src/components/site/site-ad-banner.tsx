"use client";

import { SiteAdCarousel } from "@/components/site/site-ad-carousel";
import { useSiteAds, adsForPlacement } from "@/hooks/use-site-ads";
import type { AdPlacement } from "@/lib/api";

export function SiteAdBanner({ placement }: { placement: AdPlacement }) {
  const ads = useSiteAds();
  const placementAds = adsForPlacement(ads, placement);

  if (placementAds.length === 0) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <SiteAdCarousel ads={placementAds} variant="inline" />
    </div>
  );
}
