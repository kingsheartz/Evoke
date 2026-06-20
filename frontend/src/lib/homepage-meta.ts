import type { SectionType } from "@/lib/cms-sections";
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

export function defaultHomepageMeta(): HomepageMeta {
  return {
    stats: { enabled: true, items: defaultHomepageStats },
    features: {
      enabled: true,
      eyebrow: "Why EOKE",
      heading: "Built for excellence",
      items: defaultHomepageFeatures,
    },
    sections: [],
  };
}

export function parseHomepageMeta(meta: Record<string, unknown> | undefined | null): HomepageMeta {
  const defaults = defaultHomepageMeta();
  if (!meta || typeof meta !== "object") return defaults;

  const stats = meta.stats as HomepageMeta["stats"] | undefined;
  const features = meta.features as HomepageMeta["features"] | undefined;
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
    sections: Array.isArray(sections) ? sections : [],
  };
}

export function createHomepageSection(type: SectionType): HomepageSection {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    component_type: type,
    content: defaultSectionContent(type),
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
