export type HomeVariant = "default" | "immersive" | "motion";

export const HOME_VARIANT_COOKIE = "evoke-home-variant";

export const HOME_VARIANT_OPTIONS: { id: HomeVariant; label: string; description: string }[] = [
  {
    id: "default",
    label: "Default",
    description: "Classic hero, division cards, stats, and features",
  },
  {
    id: "immersive",
    label: "Immersive",
    description: "Cinematic sci-fi homepage with holographic division portals",
  },
  {
    id: "motion",
    label: "Motion",
    description: "Scroll-driven athletic journey across divisions",
  },
];

const VALID_VARIANTS = new Set<HomeVariant>(HOME_VARIANT_OPTIONS.map((o) => o.id));

export function isHomeVariant(value: string | null | undefined): value is HomeVariant {
  return Boolean(value && VALID_VARIANTS.has(value as HomeVariant));
}

/** Resolved from cookie → env → fallback (default). */
export function resolveHomeVariant(cookieValue?: string | null): HomeVariant {
  if (isHomeVariant(cookieValue)) return cookieValue;
  const env = process.env.NEXT_PUBLIC_HOME_VARIANT;
  if (isHomeVariant(env)) return env;
  return "default";
}

/** Show the live switcher while building / previewing. */
export function homeVariantSwitchEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_HOME_VARIANT_SWITCH === "true") return true;
  if (process.env.NEXT_PUBLIC_HOME_VARIANT_SWITCH === "false") return false;
  return process.env.NODE_ENV !== "production";
}

/** Hero scroll hint target per variant. */
export function homeVariantScrollTarget(variant: HomeVariant): string {
  if (variant === "motion") return "#motion-journey";
  return "#divisions";
}
