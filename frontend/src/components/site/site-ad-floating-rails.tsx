"use client";

import { useMemo } from "react";
import { SiteAdUnit } from "@/components/site/site-ad-unit";
import { useSiteAds } from "@/hooks/use-site-ads";
import { normalizeAdvertisement } from "@/lib/ad-placements";

export function SiteAdFloatingRails() {
  const ads = useSiteAds();

  const { left, right, mobileFloating } = useMemo(() => {
    const normalized = ads.map(normalizeAdvertisement);
    const leftAd = normalized.find((ad) => ad.placement === "floating_left");
    const rightAd = normalized.find((ad) => ad.placement === "floating_right");
    return {
      left: leftAd,
      right: rightAd,
      // On mobile only one floating slot — prefer left, then right (lowest sort order first from API).
      mobileFloating: leftAd ?? rightAd,
    };
  }, [ads]);

  return (
    <>
      {left && (
        <div className="pointer-events-none fixed bottom-24 left-4 z-30 hidden w-44 lg:bottom-auto lg:left-6 lg:top-1/2 lg:block lg:w-48 lg:-translate-y-1/2 xl:w-52">
          <div className="pointer-events-auto">
            <SiteAdUnit ad={left} variant="floating" />
          </div>
        </div>
      )}

      {right && (
        <div className="pointer-events-none fixed bottom-24 right-4 z-30 hidden w-44 lg:bottom-auto lg:right-6 lg:top-1/2 lg:block lg:w-48 lg:-translate-y-1/2 xl:w-52">
          <div className="pointer-events-auto">
            <SiteAdUnit ad={right} variant="floating" />
          </div>
        </div>
      )}

      {mobileFloating && (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-40 lg:hidden">
          <div className="pointer-events-auto mx-auto max-w-[11rem] sm:max-w-xs">
            <SiteAdUnit ad={mobileFloating} variant="floating" className="shadow-xl" />
          </div>
        </div>
      )}
    </>
  );
}
