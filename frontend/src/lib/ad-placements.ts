import type { AdPlacement, Advertisement } from "@/lib/api";

/** Map legacy placement values saved before the public-site-only refresh. */
const LEGACY_PLACEMENT: Record<string, AdPlacement> = {
  admin_sidebar: "floating_right",
  site_header: "top_strip",
};

export const AD_PLACEMENT_OPTIONS: { value: AdPlacement; label: string; hint: string }[] = [
  {
    value: "top_strip",
    label: "Top strip (below header)",
    hint: "Slim bar under the nav. Multiple ads rotate automatically (use Sort order).",
  },
  {
    value: "homepage",
    label: "Homepage inline",
    hint: "Below the hero. Multiple ads rotate with dot indicators.",
  },
  {
    value: "footer",
    label: "Above footer",
    hint: "On all pages above the footer. Multiple ads rotate with dot indicators.",
  },
  {
    value: "floating_left",
    label: "Floating — left side",
    hint: "One ad per side — lowest sort order wins if several use the same placement.",
  },
  {
    value: "floating_right",
    label: "Floating — right side",
    hint: "One ad per side — lowest sort order wins if several use the same placement.",
  },
];

export function normalizeAdPlacement(placement: string): AdPlacement {
  if (LEGACY_PLACEMENT[placement]) return LEGACY_PLACEMENT[placement];
  const valid = AD_PLACEMENT_OPTIONS.some((p) => p.value === placement);
  return valid ? (placement as AdPlacement) : "floating_right";
}

export function normalizeAdvertisement(ad: Advertisement): Advertisement {
  return {
    ...ad,
    placement: normalizeAdPlacement(ad.placement),
    dismissible: ad.dismissible ?? true,
  };
}

export const AD_DISMISS_STORAGE_KEY = "evoke-ad-dismissed";
export const AD_REVISION_STORAGE_KEY = "evoke-ad-settings-revision";

/** Clear visitor dismissals when admin saves new ad settings. */
export function syncAdDismissalsWithRevision(revision: string | null | undefined): void {
  if (typeof window === "undefined" || revision == null || revision === "") return;

  const stored = localStorage.getItem(AD_REVISION_STORAGE_KEY);
  if (stored === revision) return;

  localStorage.removeItem(AD_DISMISS_STORAGE_KEY);
  localStorage.setItem(AD_REVISION_STORAGE_KEY, revision);
  window.dispatchEvent(new CustomEvent("evoke-ad-dismissed"));
}

export function readDismissedAdIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(AD_DISMISS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function dismissAd(id: string): void {
  const ids = readDismissedAdIds();
  ids.add(id);
  localStorage.setItem(AD_DISMISS_STORAGE_KEY, JSON.stringify([...ids]));
}
