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
import type { HomepageSection } from "@/lib/homepage-meta";

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
  return {
    sections: Array.isArray(sections) ? (sections as HomepageSection[]) : [],
  };
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
    description: "",
    icon: "graduation-cap",
    accent_style: "accent",
    home_gradient: null,
    highlight_cards: [],
    footer_note: null,
    meta: { sections: [] },
    is_active: true,
  };
}

/** Fallback nav when API is unavailable. */
export const FALLBACK_DIVISION_NAV: DivisionNavItem[] = [
  { slug: "academy", nav_label: "EVOKE Academy", icon: "graduation-cap", public_path: "/academy", sort_order: 1, show_in_nav: true },
  { slug: "shop", nav_label: "EOKE Sports", icon: "shopping-bag", public_path: "/shop", sort_order: 2, show_in_nav: true },
  { slug: "tours", nav_label: "EVOKE Tours", icon: "plane", public_path: "/tours", sort_order: 3, show_in_nav: true },
];
