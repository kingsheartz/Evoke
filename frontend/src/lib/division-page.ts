import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Clock,
  Compass,
  Dumbbell,
  Globe,
  GraduationCap,
  Mountain,
  Package,
  Plane,
  Shirt,
  ShoppingBag,
  Users,
} from "lucide-react";
import { apiClient, isNextProductionBuild } from "@/lib/api";
import type { HomepageSection } from "@/lib/homepage-meta";

export type SectionDefaultsDivision = "tours" | "shop" | "academy";

export interface DivisionFeaturedCatalogConfig {
  enabled: boolean;
  vertical: SectionDefaultsDivision;
  featured_only?: boolean;
  catalog_source?: "featured" | "trending" | "latest";
  limit?: number;
  heading?: string;
  view_all_label?: string;
}

export type DivisionAccentStyle =
  | "accent"
  | "emerald"
  | "orange"
  | "rose"
  | "blue"
  | "amber"
  | "violet";

export interface DivisionHighlightCard {
  title: string;
  description: string;
  icon: string;
  link_url?: string;
  link_label?: string;
}

export interface DivisionNavItem {
  slug: string;
  nav_label: string;
  icon: string;
  public_path: string;
  sort_order: number;
  show_in_nav: boolean;
}

export interface DivisionPageData {
  slug: string;
  nav_label: string;
  sort_order: number;
  show_in_nav: boolean;
  public_path: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  accent_style: DivisionAccentStyle;
  home_gradient: string | null;
  highlight_cards: DivisionHighlightCard[];
  footer_note: string | null;
  meta: Record<string, unknown>;
  is_active?: boolean;
}

/** Site routes that must not be used as division URL slugs. */
export const RESERVED_SITE_SLUGS = new Set([
  "account",
  "admin",
  "login",
  "sign-in",
  "register",
  "p",
  "api",
  "health",
  "search",
  "modules",
  "homepage",
  "tours",
  "shop",
  "academy",
]);

export const DIVISION_ACCENT_STYLES: { value: DivisionAccentStyle; label: string }[] = [
  { value: "accent", label: "Theme accent" },
  { value: "violet", label: "Violet" },
  { value: "blue", label: "Blue" },
  { value: "emerald", label: "Emerald" },
  { value: "orange", label: "Orange" },
  { value: "rose", label: "Rose" },
  { value: "amber", label: "Amber" },
];

export const DIVISION_ICONS = [
  { value: "graduation-cap", label: "Academy" },
  { value: "shopping-bag", label: "Shop" },
  { value: "plane", label: "Tours" },
  { value: "book-open", label: "Book" },
  { value: "clock", label: "Clock" },
  { value: "users", label: "Users" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "shirt", label: "Apparel" },
  { value: "package", label: "Package" },
  { value: "compass", label: "Compass" },
  { value: "globe", label: "Globe" },
  { value: "mountain", label: "Mountain" },
] as const;

const iconMap: Record<string, LucideIcon> = {
  "graduation-cap": GraduationCap,
  "shopping-bag": ShoppingBag,
  plane: Plane,
  "book-open": BookOpen,
  clock: Clock,
  users: Users,
  dumbbell: Dumbbell,
  shirt: Shirt,
  package: Package,
  compass: Compass,
  globe: Globe,
  mountain: Mountain,
};

const cardAccent: Record<
  DivisionAccentStyle,
  { ring: string; bg: string; icon: string }
> = {
  accent: { ring: "ring-accent/20", bg: "bg-accent/10", icon: "text-accent-soft" },
  violet: { ring: "ring-violet-500/20", bg: "bg-violet-500/10", icon: "text-violet-400" },
  blue: { ring: "ring-blue-500/20", bg: "bg-blue-500/10", icon: "text-blue-400" },
  emerald: { ring: "ring-emerald-500/20", bg: "bg-emerald-500/10", icon: "text-emerald-400" },
  orange: { ring: "ring-orange-500/20", bg: "bg-orange-500/10", icon: "text-orange-400" },
  rose: { ring: "ring-rose-500/20", bg: "bg-rose-500/10", icon: "text-rose-400" },
  amber: { ring: "ring-amber-500/20", bg: "bg-amber-500/10", icon: "text-amber-400" },
};

export function resolveDivisionIcon(name?: string): LucideIcon {
  if (name && iconMap[name]) return iconMap[name];
  return GraduationCap;
}

export function getDivisionCardAccent(style: DivisionAccentStyle = "accent") {
  return cardAccent[style] ?? cardAccent.accent;
}

export function slugifyDivision(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseDivisionMeta(meta: Record<string, unknown> | undefined | null) {
  const sections = meta?.sections;
  const featuredCatalog = meta?.featured_catalog;
  return {
    sections: Array.isArray(sections) ? (sections as HomepageSection[]) : [],
    featured_catalog:
      featuredCatalog && typeof featuredCatalog === "object"
        ? (featuredCatalog as DivisionFeaturedCatalogConfig)
        : null,
  };
}

const catalogLabels: Record<SectionDefaultsDivision, string> = {
  tours: "tour packages",
  shop: "products",
  academy: "courses",
};

export function defaultFeaturedCatalogForVertical(
  vertical: SectionDefaultsDivision,
): DivisionFeaturedCatalogConfig {
  const label = catalogLabels[vertical];
  return {
    enabled: true,
    vertical,
    featured_only: vertical !== "academy",
    limit: 6,
    heading: `Featured ${label}`,
    view_all_label: `Browse all ${label}`,
  };
}

export function resolveDivisionFeaturedCatalog(page: DivisionPageData): DivisionFeaturedCatalogConfig | null {
  const { featured_catalog: fromMeta } = parseDivisionMeta(page.meta);

  if (fromMeta?.enabled === false) {
    return null;
  }

  if (fromMeta?.vertical && fromMeta.enabled) {
    return {
      ...defaultFeaturedCatalogForVertical(fromMeta.vertical),
      ...fromMeta,
      enabled: true,
    };
  }

  if (page.slug === "tours" || page.slug === "shop" || page.slug === "academy") {
    return defaultFeaturedCatalogForVertical(page.slug);
  }

  return null;
}

export function emptyDivisionForm(slug: string, navLabel: string): DivisionPageData {
  return {
    slug,
    nav_label: navLabel,
    sort_order: 0,
    show_in_nav: true,
    public_path: `/${slug}`,
    badge: navLabel,
    title: navLabel,
    description: `Landing page for ${navLabel}.`,
    icon: "graduation-cap",
    accent_style: "accent",
    home_gradient: null,
    highlight_cards: [],
    footer_note: null,
    meta: {
      sections: [],
      featured_catalog: {
        enabled: false,
        vertical: "academy",
        featured_only: true,
        limit: 6,
      },
    },
    is_active: true,
  };
}

/** Fallback nav when API is unavailable. */
export const FALLBACK_DIVISION_NAV: DivisionNavItem[] = [
  { slug: "academy", nav_label: "EVOKE Academy", icon: "graduation-cap", public_path: "/academy", sort_order: 1, show_in_nav: true },
  { slug: "shop", nav_label: "EOKE Sports", icon: "shopping-bag", public_path: "/shop", sort_order: 2, show_in_nav: true },
  { slug: "tours", nav_label: "EVOKE Tours", icon: "plane", public_path: "/tours", sort_order: 3, show_in_nav: true },
];

type CoreDivisionSlug = "academy" | "shop" | "tours";

const FALLBACK_DIVISION_PAGES: Record<CoreDivisionSlug, DivisionPageData> = {
  academy: {
    slug: "academy",
    nav_label: "EVOKE Academy",
    sort_order: 1,
    show_in_nav: true,
    public_path: "/academy",
    badge: "EVOKE Academy",
    title: "Train with the best",
    description:
      "World-class instruction across martial arts, wellness, aquatics, and performing arts — all under one roof.",
    icon: "graduation-cap",
    accent_style: "accent",
    home_gradient: "from-blue-600 to-indigo-700",
    highlight_cards: [
      {
        title: "Karate",
        description: "All ages",
        icon: "users",
        link_url: "/academy/courses",
        link_label: "Browse courses",
      },
      {
        title: "Yoga & Wellness",
        description: "Beginner to Advanced",
        icon: "book-open",
        link_url: "/academy/courses",
        link_label: "View programs",
      },
      {
        title: "Swimming",
        description: "Certified coaches",
        icon: "clock",
        link_url: "/academy/courses",
        link_label: "See schedules",
      },
    ],
    footer_note: "Browse courses and enroll online.",
    meta: {
      sections: [],
      featured_catalog: {
        enabled: true,
        vertical: "academy",
        featured_only: false,
        limit: 6,
        heading: "Featured courses",
        view_all_label: "Browse all courses",
      },
    },
    is_active: true,
  },
  shop: {
    slug: "shop",
    nav_label: "EOKE Sports",
    sort_order: 2,
    show_in_nav: true,
    public_path: "/shop",
    badge: "EOKE Sports",
    title: "Gear up to perform",
    description: "Curated equipment, apparel, and fitness accessories — quality-tested and ready to ship.",
    icon: "shopping-bag",
    accent_style: "emerald",
    home_gradient: "from-emerald-600 to-teal-700",
    highlight_cards: [
      {
        title: "Equipment",
        description: "Professional-grade gear for every sport",
        icon: "dumbbell",
        link_url: "/shop/products",
        link_label: "Shop equipment",
      },
      {
        title: "Apparel",
        description: "Performance wear and team kits",
        icon: "shirt",
        link_url: "/shop/products",
        link_label: "Shop apparel",
      },
      {
        title: "Accessories",
        description: "Bags, bottles, guards, and more",
        icon: "package",
        link_url: "/shop/products",
        link_label: "Shop accessories",
      },
    ],
    footer_note: "Shop curated gear and academy merchandise online.",
    meta: {
      sections: [],
      featured_catalog: {
        enabled: true,
        vertical: "shop",
        featured_only: true,
        limit: 6,
        heading: "Featured products",
        view_all_label: "Browse all products",
      },
    },
    is_active: true,
  },
  tours: {
    slug: "tours",
    nav_label: "EVOKE Tours",
    sort_order: 3,
    show_in_nav: true,
    public_path: "/tours",
    badge: "EVOKE Tours",
    title: "Journeys worth remembering",
    description: "From serene domestic retreats to international adventures — every trip crafted with care.",
    icon: "plane",
    accent_style: "orange",
    home_gradient: "from-orange-600 to-rose-700",
    highlight_cards: [
      {
        title: "Domestic Escapes",
        description: "Weekend getaways and cultural tours across India",
        icon: "compass",
        link_url: "/tours/packages",
        link_label: "Browse packages",
      },
      {
        title: "International",
        description: "Curated global destinations with premium stays",
        icon: "globe",
        link_url: "/tours/packages",
        link_label: "Explore trips",
      },
      {
        title: "Adventure",
        description: "Trekking, diving, and adrenaline experiences",
        icon: "mountain",
        link_url: "/tours/packages",
        link_label: "Find adventures",
      },
    ],
    footer_note: "Explore packages and book your next journey.",
    meta: {
      sections: [],
      featured_catalog: {
        enabled: true,
        vertical: "tours",
        featured_only: true,
        limit: 6,
        heading: "Featured tour packages",
        view_all_label: "Browse all tour packages",
      },
    },
    is_active: true,
  },
};

function fallbackDivisionPage(slug: string): DivisionPageData | null {
  if (slug === "academy" || slug === "shop" || slug === "tours") {
    return FALLBACK_DIVISION_PAGES[slug];
  }
  return null;
}

/** Load division page CMS data; use seeded fallbacks during Docker image build. */
export async function loadDivisionPage(slug: string): Promise<DivisionPageData | null> {
  try {
    const response = await apiClient.getDivisionPage(slug);
    if (response.data) return response.data;
    if (isNextProductionBuild()) return fallbackDivisionPage(slug);
    return null;
  } catch {
    if (isNextProductionBuild()) return fallbackDivisionPage(slug);
    throw new Error(`Failed to load division page: ${slug}`);
  }
}
