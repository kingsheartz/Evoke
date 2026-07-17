import type { SectionType, SectionDefaultsContext } from "@/lib/cms-sections";
import { defaultSectionContent } from "@/lib/cms-sections";

export interface HomepageStat {
  value: string;
  label: string;
}

export interface HomepageFeature {
  icon: string;
  title: string;
  description: string;
}

export interface HomepageSection {
  id: string;
  component_type: SectionType;
  content: Record<string, unknown>;
  is_visible: boolean;
  sort_order: number;
}

export type MotionArtTheme = "academy" | "sports" | "tours";

export interface MotionChapter {
  id: string;
  art_theme: MotionArtTheme;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  tags: string[];
  start_icon: string;
  end_icon: string;
  sort_order?: number;
}

export interface HomepageMeta {
  stats?: {
    enabled?: boolean;
    items?: HomepageStat[];
  };
  features?: {
    enabled?: boolean;
    eyebrow?: string;
    heading?: string;
    items?: HomepageFeature[];
  };
  motion?: {
    chapters?: MotionChapter[];
  };
  sections?: HomepageSection[];
}

export const defaultHomepageStats: HomepageStat[] = [
  { value: "3", label: "Business Divisions" },
  { value: "12+", label: "Academy Programs" },
  { value: "500+", label: "Products Listed" },
  { value: "50+", label: "Travel Packages" },
];

export const defaultHomepageFeatures: HomepageFeature[] = [
  { icon: "sparkles", title: "Premium Experience", description: "Every touchpoint designed with intention — from booking to delivery." },
  { icon: "users", title: "Expert-Led Academy", description: "World-class instructors across karate, yoga, swimming, dance, and more." },
  { icon: "target", title: "Curated Sports Gear", description: "Hand-picked equipment and apparel for athletes at every level." },
  { icon: "globe", title: "Global Adventures", description: "Domestic getaways, international tours, and adrenaline-packed expeditions." },
  { icon: "shield", title: "Trusted Platform", description: "Secure payments, verified partners, and transparent booking flows." },
  { icon: "award", title: "One Membership", description: "Unified accounts across all three divisions — seamless and simple." },
];

export const MOTION_ART_THEMES = [
  { value: "academy", label: "Academy art" },
  { value: "sports", label: "Sports art" },
  { value: "tours", label: "Tours art" },
] as const;

export const defaultMotionChapters: MotionChapter[] = [
  {
    id: "academy",
    art_theme: "academy",
    label: "Academy",
    eyebrow: "EVOKE Academy",
    title: "Train with purpose",
    description: "Martial arts, yoga, swimming — structured programs led by coaches who care about progress.",
    href: "/academy",
    cta: "Browse courses",
    tags: ["Karate", "Yoga", "Swimming"],
    start_icon: "graduation-cap",
    end_icon: "map-pin",
    sort_order: 0,
  },
  {
    id: "sports",
    art_theme: "sports",
    label: "Sports",
    eyebrow: "EOKE Sports",
    title: "Play at your peak",
    description: "Gear, apparel, and equipment for athletes who show up — from training days to match day.",
    href: "/shop",
    cta: "Shop now",
    tags: ["Equipment", "Apparel", "Accessories"],
    start_icon: "shopping-bag",
    end_icon: "map-pin",
    sort_order: 1,
  },
  {
    id: "tours",
    art_theme: "tours",
    label: "Tours",
    eyebrow: "EVOKE Tours",
    title: "Travel that moves you",
    description: "Handpicked domestic and international journeys — adventure, culture, and memories in motion.",
    href: "/tours",
    cta: "View packages",
    tags: ["Domestic", "International", "Adventure"],
    start_icon: "map-pin",
    end_icon: "map-pin",
    sort_order: 2,
  },
];

export function createMotionChapter(artTheme: MotionArtTheme = "academy"): MotionChapter {
  return {
    id: `chapter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    art_theme: artTheme,
    label: "",
    eyebrow: "",
    title: "",
    description: "",
    href: "/",
    cta: "Learn more",
    tags: [],
    start_icon: "map-pin",
    end_icon: "map-pin",
  };
}

const VALID_MOTION_THEMES = new Set<MotionArtTheme>(["academy", "sports", "tours"]);

function normalizeMotionChapter(raw: Partial<MotionChapter>, index: number): MotionChapter {
  const defaults = defaultMotionChapters[index] ?? defaultMotionChapters[0];
  const artTheme = VALID_MOTION_THEMES.has(raw.art_theme as MotionArtTheme)
    ? (raw.art_theme as MotionArtTheme)
    : defaults?.art_theme ?? "academy";

  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : createMotionChapter(artTheme).id,
    art_theme: artTheme,
    label: raw.label?.trim() || defaults?.label || `Chapter ${index + 1}`,
    eyebrow: raw.eyebrow?.trim() || defaults?.eyebrow || "",
    title: raw.title?.trim() || defaults?.title || "",
    description: raw.description?.trim() || defaults?.description || "",
    href: raw.href?.trim() || defaults?.href || "/",
    cta: raw.cta?.trim() || defaults?.cta || "Learn more",
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === "string" && t.trim()).map((t) => t.trim()) : defaults?.tags ?? [],
    start_icon: raw.start_icon?.trim() || defaults?.start_icon || "map-pin",
    end_icon: raw.end_icon?.trim() || defaults?.end_icon || "map-pin",
    sort_order: index,
  };
}

export function normalizeMotionChapters(chapters: MotionChapter[] | undefined | null): MotionChapter[] {
  if (!chapters?.length) return defaultMotionChapters;
  return [...chapters]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((chapter, index) => normalizeMotionChapter(chapter, index));
}

export function motionChapterIndexLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function motionChapterPanelClass(theme: MotionArtTheme): string {
  return `motion-journey__panel--${theme}`;
}

export function motionChapterAccentClass(theme: MotionArtTheme): string {
  return `motion-journey__accent--${theme}`;
}

export function defaultHomepageMeta(): HomepageMeta {
  return {
    stats: { enabled: true, items: defaultHomepageStats },
    features: {
      enabled: true,
      eyebrow: "Why EOKE",
      heading: "Built for excellence",
      items: defaultHomepageFeatures,
    },
    motion: { chapters: defaultMotionChapters },
    sections: [],
  };
}

export function parseHomepageMeta(meta: Record<string, unknown> | undefined | null): HomepageMeta {
  const defaults = defaultHomepageMeta();
  if (!meta || typeof meta !== "object") return defaults;

  const stats = meta.stats as HomepageMeta["stats"] | undefined;
  const features = meta.features as HomepageMeta["features"] | undefined;
  const motion = meta.motion as HomepageMeta["motion"] | undefined;
  const sections = meta.sections as HomepageSection[] | undefined;

  return {
    stats: {
      enabled: stats?.enabled ?? defaults.stats?.enabled ?? true,
      items: stats?.items?.length ? stats.items : defaults.stats?.items,
    },
    features: {
      enabled: features?.enabled ?? defaults.features?.enabled ?? true,
      eyebrow: features?.eyebrow ?? defaults.features?.eyebrow,
      heading: features?.heading ?? defaults.features?.heading,
      items: features?.items?.length ? features.items : defaults.features?.items,
    },
    motion: {
      chapters: normalizeMotionChapters(motion?.chapters as MotionChapter[] | undefined),
    },
    sections: Array.isArray(sections) ? sections : [],
  };
}

export function createHomepageSection(
  type: SectionType,
  context: SectionDefaultsContext = {},
): HomepageSection {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    component_type: type,
    content: defaultSectionContent(type, context),
    is_visible: true,
    sort_order: 0,
  };
}

export const ENTRY_CARD_ICONS = [
  { value: "graduation-cap", label: "Academy" },
  { value: "shopping-bag", label: "Shop" },
  { value: "plane", label: "Tours" },
] as const;

export const FEATURE_ICONS = [
  { value: "sparkles", label: "Sparkles" },
  { value: "users", label: "Users" },
  { value: "target", label: "Target" },
  { value: "globe", label: "Globe" },
  { value: "shield", label: "Shield" },
  { value: "award", label: "Award" },
  { value: "star", label: "Star" },
  { value: "zap", label: "Zap" },
] as const;
