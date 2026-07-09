export type HeaderComponentType =
  | "search"
  | "cta_button"
  | "cta_link"
  | "phone"
  | "email"
  | "whatsapp"
  | "social_links"
  | "text"
  | "badge"
  | "divider"
  | "hours"
  | "location";

export type HeaderComponentVisibility = "desktop" | "mobile" | "all";

export type HeaderCtaVariant = "primary" | "outline" | "ghost";

export type HeaderAnnouncementTone = "accent" | "muted" | "dark";

export type HeaderSocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "whatsapp"
  | "tiktok"
  | "telegram"
  | "discord"
  | "github"
  | "pinterest"
  | "snapchat"
  | "custom";

import type { TextFormat } from "@/lib/text-format";

export interface HeaderSocialLink {
  platform: HeaderSocialPlatform;
  url: string;
  label?: string;
  /** Lucide or brand icon id — overrides platform default when set. */
  icon?: string;
}

export interface HeaderComponent {
  id: string;
  type: HeaderComponentType;
  enabled: boolean;
  visibility: HeaderComponentVisibility;
  label?: string;
  label_format?: TextFormat;
  href?: string;
  placeholder?: string;
  placeholder_format?: TextFormat;
  variant?: HeaderCtaVariant;
  /** Optional icon override (see header-icons catalog). */
  icon?: string;
  social?: HeaderSocialLink[];
}

export interface HeaderAnnouncement {
  enabled: boolean;
  text: string;
  text_format?: TextFormat;
  href?: string;
  dismissible: boolean;
  tone: HeaderAnnouncementTone;
}

export interface BrandHeaderConfig {
  announcement: HeaderAnnouncement;
  components: HeaderComponent[];
}

export const DEFAULT_HEADER_CONFIG: BrandHeaderConfig = {
  announcement: {
    enabled: false,
    text: "",
    href: "",
    dismissible: true,
    tone: "accent",
  },
  components: [],
};

export const HEADER_COMPONENT_CATALOG: {
  type: HeaderComponentType;
  label: string;
  description: string;
}[] = [
  { type: "search", label: "Search bar", description: "Compact search input in the header" },
  { type: "cta_button", label: "CTA button", description: "Primary, outline, or ghost action button" },
  { type: "cta_link", label: "Text link", description: "Inline navigation or utility link" },
  { type: "phone", label: "Phone link", description: "Click-to-call with phone icon" },
  { type: "email", label: "Email link", description: "Mailto link with envelope icon" },
  { type: "whatsapp", label: "WhatsApp", description: "Chat link with WhatsApp icon" },
  { type: "social_links", label: "Social icons", description: "Row of social profile links" },
  { type: "text", label: "Plain text", description: "Short label or info line" },
  { type: "badge", label: "Badge / pill", description: "Highlighted status or promo chip" },
  { type: "divider", label: "Divider", description: "Vertical separator between items" },
  { type: "hours", label: "Business hours", description: "Hours line with clock icon" },
  { type: "location", label: "Location", description: "Address or city with map pin" },
];

export function createHeaderComponent(type: HeaderComponentType): HeaderComponent {
  const id = `hdr_${type}_${Date.now().toString(36)}`;
  const base: HeaderComponent = { id, type, enabled: true, visibility: "desktop" };

  switch (type) {
    case "search":
      return { ...base, placeholder: "Search…", href: "/shop" };
    case "cta_button":
      return { ...base, label: "Contact us", href: "/contact", variant: "primary" };
    case "cta_link":
      return { ...base, label: "Learn more", href: "/" };
    case "phone":
      return { ...base, label: "+91 98765 43210", href: "tel:+919876543210", icon: "phone" };
    case "email":
      return { ...base, label: "hello@example.com", href: "mailto:hello@example.com", icon: "mail" };
    case "whatsapp":
      return { ...base, label: "WhatsApp", href: "https://wa.me/917902264073", icon: "brand-whatsapp" };
    case "social_links":
      return {
        ...base,
        social: [
          { platform: "instagram", url: "https://instagram.com", label: "Instagram", icon: "brand-instagram" },
          { platform: "facebook", url: "https://facebook.com", label: "Facebook", icon: "brand-facebook" },
        ],
      };
    case "text":
      return { ...base, label: "Free shipping on orders over ₹999" };
    case "badge":
      return { ...base, label: "New" };
    case "divider":
      return { ...base, visibility: "desktop" };
    case "hours":
      return { ...base, label: "Mon–Sat 9am–6pm", icon: "clock" };
    case "location":
      return { ...base, label: "Kochi, Kerala", href: "https://maps.google.com", icon: "map-pin" };
    default:
      return base;
  }
}

export function mergeHeaderConfig(
  defaults: BrandHeaderConfig,
  override: Partial<BrandHeaderConfig> | null | undefined,
): BrandHeaderConfig {
  if (!override) return defaults;

  return {
    announcement: {
      enabled: override.announcement?.enabled ?? defaults.announcement.enabled,
      text: override.announcement?.text ?? defaults.announcement.text,
      href: override.announcement?.href ?? defaults.announcement.href ?? "",
      dismissible: override.announcement?.dismissible ?? defaults.announcement.dismissible,
      tone: override.announcement?.tone ?? defaults.announcement.tone,
    },
    components: override.components ?? defaults.components,
  };
}

export function headerConfigEquals(a: BrandHeaderConfig, b: BrandHeaderConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
