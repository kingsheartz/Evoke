import { useEffect, useSyncExternalStore } from "react";
import { normalizeAdvertisement, syncAdDismissalsWithRevision } from "@/lib/ad-placements";
import { apiClient, type AdPlacement, type Advertisement } from "@/lib/api";

function activeAds(ads: Advertisement[]): Advertisement[] {
  return ads.filter((ad) => Boolean(ad.enabled)).map(normalizeAdvertisement);
}

type AdsCache = {
  ads: Advertisement[];
  loaded: boolean;
};

let cache: AdsCache = { ads: [], loaded: false };
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Advertisement[] {
  return cache.ads;
}

const EMPTY_ADS: Advertisement[] = [];

function getServerSnapshot(): Advertisement[] {
  return EMPTY_ADS;
}

async function fetchAds(force = false): Promise<void> {
  if (inflight && !force) {
    await inflight;
    return;
  }

  inflight = apiClient
    .getPublicAds()
    .then((response) => {
      syncAdDismissalsWithRevision(response.revision);
      cache = { ads: activeAds(response.data ?? []), loaded: true };
      emit();
    })
    .catch(() => {
      if (!cache.loaded) {
        cache = { ads: [], loaded: true };
        emit();
      }
    })
    .finally(() => {
      inflight = null;
    });

  await inflight;
}

function ensureLoaded() {
  if (!cache.loaded && !inflight) {
    void fetchAds();
  }
}

/** Drop cached ads and refetch (e.g. after admin saves advertisement settings). */
export function invalidateSiteAdsCache() {
  cache = { ads: [], loaded: false };
  emit();
  void fetchAds(true);
}

export function useSiteAds(): Advertisement[] {
  const ads = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureLoaded();

    const onFocus = () => void fetchAds(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return ads;
}

export function adsForPlacement(ads: Advertisement[], placement: AdPlacement): Advertisement[] {
  return ads.filter((ad) => ad.placement === placement && ad.image_url?.trim());
}
