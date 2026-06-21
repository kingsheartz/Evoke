import { SECTION_TYPES } from "@/lib/api";
import type { TimelineVariant, OfferingVertical } from "@/lib/offerings";
import type { TextFormat } from "@/lib/text-format";

export type SectionType = (typeof SECTION_TYPES)[number]["value"];

export type SectionDefaultsDivision = "tours" | "shop" | "academy";

export interface SectionDefaultsContext {
  division?: SectionDefaultsDivision;
}

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface FaqItem {
  question: string;
  question_format?: TextFormat;
  answer: string;
  answer_format?: TextFormat;
}

export interface CardItem {
  title: string;
  title_format?: TextFormat;
  description: string;
  description_format?: TextFormat;
  image_url?: string;
  icon?: string;
  link_url?: string;
  link_label?: string;
  link_label_format?: TextFormat;
  price?: string;
  price_format?: TextFormat;
  badge?: string;
  badge_format?: TextFormat;
  meta_line?: string;
  meta_line_format?: TextFormat;
}

export interface TestimonialItem {
  quote: string;
  quote_format?: TextFormat;
  author: string;
  author_format?: TextFormat;
  role?: string;
  role_format?: TextFormat;
  avatar_url?: string;
}

export interface FormField {
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  /** Options for select, radio, or checkbox (multiple choice) fields. */
  options?: string[];
}

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "tel"
  | "date"
  | "file"
  | "select"
  | "radio"
  | "checkbox";

export interface StatItem {
  label: string;
  label_format?: TextFormat;
  value: string;
  value_format?: TextFormat;
  icon?: string;
}

export interface StatsContent {
  heading?: string;
  heading_format?: TextFormat;
  columns?: 2 | 3 | 4;
  items?: StatItem[];
}

export interface ItineraryDay {
  title: string;
  body?: string;
  /** Marks first/last day styling on the timeline. */
  milestone?: "start" | "end";
}

export interface ItineraryContent {
  heading?: string;
  heading_format?: TextFormat;
  cost_heading?: string;
  cost_heading_format?: TextFormat;
  cost_body?: string;
  cost_body_format?: TextFormat;
  items?: ItineraryDay[];
  variant?: TimelineVariant;
}

export interface InclusionsContent {
  heading?: string;
  heading_format?: TextFormat;
  included?: string[];
  excluded?: string[];
  included_label?: string;
  included_label_format?: TextFormat;
  excluded_label?: string;
  excluded_label_format?: TextFormat;
}

export interface BannerContent {
  heading?: string;
  heading_format?: TextFormat;
  subheading?: string;
  subheading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  image_url?: string;
  cta_label?: string;
  cta_label_format?: TextFormat;
  cta_url?: string;
}

export interface CmsButtonItem {
  label: string;
  label_format?: TextFormat;
  url: string;
  variant?: "primary" | "outline" | "ghost";
  new_tab?: boolean;
}

export interface HeroSlideshowSettings {
  duration_seconds?: number;
  transition?: "fade" | "none";
  autoplay?: boolean;
  show_indicators?: boolean;
}

export interface HeroContent {
  eyebrow?: string;
  eyebrow_format?: TextFormat;
  heading?: string;
  heading_format?: TextFormat;
  heading_accent?: string;
  heading_accent_format?: TextFormat;
  heading_suffix?: string;
  heading_suffix_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  image_url?: string;
  background_images?: string[];
  slideshow?: HeroSlideshowSettings;
  video_url?: string;
  background_type?: "image" | "video";
  overlay?: "dark" | "gradient" | "light" | "none";
  height?: "full" | "tall" | "medium";
  align?: "left" | "center";
  buttons?: CmsButtonItem[];
}

export interface ButtonsContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  align?: "left" | "center";
  buttons?: CmsButtonItem[];
}

export interface TableContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  columns?: string[];
  rows?: string[][];
  striped?: boolean;
  highlight_header?: boolean;
}

export interface TabItem {
  label: string;
  label_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
}

export interface TabsContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  style?: "pills" | "underline";
  tabs?: TabItem[];
}

export interface TextContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
}

export interface GalleryContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  columns?: 2 | 3 | 4;
  preview_limit?: number;
  images?: GalleryImage[];
}

export interface FaqContent {
  heading?: string;
  heading_format?: TextFormat;
  style?: "details" | "list";
  items?: FaqItem[];
}

export interface VideoContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  video_url?: string;
  caption?: string;
  caption_format?: TextFormat;
}

export interface CardsContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  items?: CardItem[];
}

export interface TestimonialsContent {
  heading?: string;
  heading_format?: TextFormat;
  items?: TestimonialItem[];
}

export interface MapContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  embed_url?: string;
  address?: string;
}

export interface FormsContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  submit_label?: string;
  submit_label_format?: TextFormat;
  contact_email?: string;
  fields?: FormField[];
}

export interface CatalogContent {
  heading?: string;
  heading_format?: TextFormat;
  body?: string;
  body_format?: TextFormat;
  vertical: SectionDefaultsDivision;
  featured_only?: boolean;
  catalog_source?: "featured" | "trending" | "latest";
  limit?: number;
  view_all_label?: string;
  view_all_label_format?: TextFormat;
}

export type SectionContentByType = {
  banner: BannerContent;
  hero: HeroContent;
  buttons: ButtonsContent;
  table: TableContent;
  tabs: TabsContent;
  text: TextContent;
  gallery: GalleryContent;
  faq: FaqContent;
  video: VideoContent;
  cards: CardsContent;
  stats: StatsContent;
  inclusions: InclusionsContent;
  itinerary: ItineraryContent;
  catalog: CatalogContent;
  testimonials: TestimonialsContent;
  map: MapContent;
  forms: FormsContent;
};

export function isSectionType(value: string): value is SectionType {
  return SECTION_TYPES.some((t) => t.value === value);
}

export function inferDivisionFromSlug(slug: string): SectionDefaultsDivision | undefined {
  if (slug === "tours" || slug === "shop" || slug === "academy") return slug;
  return undefined;
}

function defaultStatsItems(division?: SectionDefaultsDivision): StatItem[] {
  switch (division) {
    case "tours":
      return [
        { label: "Duration", value: "5 Days – 6 Nights", icon: "clock" },
        { label: "Group size", value: "2–12", icon: "users" },
        { label: "Tour type", value: "Custom trip", icon: "compass" },
      ];
    case "shop":
      return [
        { label: "Delivery", value: "2–5 business days", icon: "package" },
        { label: "Warranty", value: "1 year", icon: "compass" },
        { label: "Returns", value: "30 days", icon: "clock" },
      ];
    case "academy":
      return [
        { label: "Duration", value: "12 weeks", icon: "clock" },
        { label: "Level", value: "All levels", icon: "users" },
        { label: "Format", value: "In person", icon: "book-open" },
      ];
    default:
      return [
        { label: "Duration", value: "Flexible", icon: "clock" },
        { label: "Capacity", value: "Small groups", icon: "users" },
        { label: "Format", value: "In person", icon: "compass" },
      ];
  }
}

function defaultTimelineContent(division?: SectionDefaultsDivision): ItineraryContent {
  switch (division) {
    case "academy":
      return {
        heading: "Curriculum",
        cost_heading: "Fees",
        cost_body: "",
        variant: "course",
        items: [
          { title: "Module 01: Foundations", body: "", milestone: "start" },
          { title: "Module 02: Practice", body: "" },
          { title: "Module 06: Assessment", body: "", milestone: "end" },
        ],
      };
    case "shop":
      return {
        heading: "Details",
        cost_heading: "Pricing",
        cost_body: "",
        variant: "product",
        items: [
          { title: "Overview", body: "", milestone: "start" },
          { title: "Specifications", body: "" },
          { title: "What's in the box", body: "", milestone: "end" },
        ],
      };
    case "tours":
    default:
      return {
        heading: "Itinerary",
        cost_heading: "Cost",
        cost_body: "",
        variant: "travel",
        items: [
          { title: "Day 01: Arrival", body: "", milestone: "start" },
          { title: "Day 02: Explore", body: "" },
          { title: "Day 06: Departure", body: "", milestone: "end" },
        ],
      };
  }
}

function defaultInclusionsContent(division?: SectionDefaultsDivision): InclusionsContent {
  switch (division) {
    case "academy":
      return {
        heading: "What's included",
        included_label: "Included",
        excluded_label: "Not included",
        included: ["Course materials", "Certification on completion", "Practice sessions"],
        excluded: ["Uniform or equipment", "Travel to venue"],
      };
    case "shop":
      return {
        heading: "Package contents",
        included_label: "Included",
        excluded_label: "Not included",
        included: ["Product", "Standard packaging", "Warranty card"],
        excluded: ["Accessories sold separately", "Extended warranty"],
      };
    case "tours":
      return {
        heading: "Inclusions & Exclusions",
        included_label: "Inclusions",
        excluded_label: "Excludes",
        included: ["Accommodation", "Daily breakfast", "Airport transfers"],
        excluded: ["Flights", "Personal expenses", "Travel insurance"],
      };
    default:
      return {
        heading: "Inclusions & Exclusions",
        included_label: "Inclusions",
        excluded_label: "Excludes",
        included: ["Item one", "Item two"],
        excluded: ["Item not included"],
      };
  }
}

export function defaultSectionContent(
  type: SectionType,
  context: SectionDefaultsContext = {},
): Record<string, unknown> {
  const division = context.division;
  switch (type) {
    case "banner":
      return {
        heading: "Section headline",
        subheading: "Supporting line",
        body: "",
        image_url: "",
        cta_label: "",
        cta_url: "",
      };
    case "hero":
      return {
        eyebrow: "EST. 2024 | FOR REAL EXPLORERS",
        heading: "WHERE MOUNTAIN",
        heading_accent: "meets",
        heading_suffix: "SEA.",
        body: "Small-group expedition company for sailing adventures, mountain journeys, and life-changing experiences in the outdoors.",
        image_url: HERO_BACKGROUND_EXAMPLES[0].url,
        background_images: HERO_BACKGROUND_EXAMPLES.map((item) => item.url),
        slideshow: { ...DEFAULT_HERO_SLIDESHOW },
        video_url: "",
        background_type: "image",
        overlay: "gradient",
        height: "full",
        align: "left",
        buttons: [
          { label: "Adventure trips", url: "/tours", variant: "primary" },
          { label: "Build a custom trip", url: "/contact", variant: "outline" },
        ],
      };
    case "buttons":
      return {
        heading: "",
        body: "",
        align: "left",
        buttons: [
          { label: "Primary action", url: "/", variant: "primary" },
          { label: "Secondary action", url: "/contact", variant: "outline" },
        ],
      };
    case "table":
      return {
        heading: "Comparison",
        body: "",
        columns: ["Package", "Duration", "Price", "Group size"],
        rows: [
          ["Coastal sailing", "5 days", "₹45,000", "6–10"],
          ["Mountain trek", "7 days", "₹38,000", "4–8"],
          ["Custom expedition", "Flexible", "On request", "2–12"],
        ],
        striped: true,
        highlight_header: true,
      };
    case "tabs":
      return {
        heading: "Explore",
        body: "",
        style: "pills",
        tabs: [
          { label: "Overview", body: "Summary of what this page covers." },
          { label: "Details", body: "Additional information visitors can switch between." },
          { label: "FAQ", body: "Common questions answered in a tab panel." },
        ],
      };
    case "text":
      return { heading: "New section", body: "" };
    case "gallery":
      return { heading: "Gallery", body: "", columns: 3, preview_limit: 6, images: [] };
    case "faq":
      return { heading: "Frequently asked questions", style: "details", items: [] };
    case "video":
      return { heading: "Watch", body: "", video_url: "", caption: "" };
    case "cards":
      return { heading: "Highlights", body: "", items: [] };
    case "stats":
      return {
        heading: "",
        columns: 3,
        items: defaultStatsItems(division),
      };
    case "inclusions":
      return { ...defaultInclusionsContent(division) };
    case "itinerary":
      return { ...defaultTimelineContent(division) };
    case "catalog": {
      const vertical = division ?? "tours";
      const catalogLabels: Record<SectionDefaultsDivision, string> = {
        tours: "tour packages",
        shop: "products",
        academy: "courses",
      };
      const label = catalogLabels[vertical];
      return {
        heading: `Featured ${label}`,
        body: "",
        vertical,
        featured_only: true,
        limit: 6,
        view_all_label: `Browse all ${label}`,
      };
    }
    case "testimonials":
      return { heading: "What people say", items: [] };
    case "map":
      return { heading: "Find us", body: "", embed_url: "", address: "" };
    case "forms":
      return {
        heading: "Get in touch",
        body: "",
        submit_label: "Send message",
        contact_email: "",
        fields: [
          { label: "Name", type: "text", required: true },
          { label: "Email", type: "email", required: true },
          { label: "Message", type: "textarea", required: true },
        ],
      };
    default:
      return { heading: "New section", body: "" };
  }
}

export function youtubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }

  return null;
}

export function vimeoEmbedUrl(url: string): string | null {
  const match = url.trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export function resolveVideoEmbed(url: string): { type: "iframe" | "video"; src: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtube = youtubeEmbedUrl(trimmed);
  if (youtube) return { type: "iframe", src: youtube };

  const vimeo = vimeoEmbedUrl(trimmed);
  if (vimeo) return { type: "iframe", src: vimeo };

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed) || trimmed.startsWith("/")) {
    return { type: "video", src: trimmed };
  }

  return null;
}

export function mapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export const HERO_BACKGROUND_EXAMPLES = [
  {
    label: "Mountain starscape",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop",
  },
  {
    label: "Alpine summit",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    label: "Ocean horizon",
    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2070&auto=format&fit=crop",
  },
] as const;

export const DEFAULT_HERO_SLIDESHOW: HeroSlideshowSettings = {
  duration_seconds: 6,
  transition: "fade",
  autoplay: true,
  show_indicators: true,
};

export function normalizeUrlList(values: string[] | undefined): string[] {
  return (values ?? []).map((item) => item.trim()).filter(Boolean);
}

export function heroBackgroundImages(content: Pick<HeroContent, "image_url" | "background_images">): string[] {
  const fromArray = normalizeUrlList(content.background_images);
  if (fromArray.length > 0) return fromArray;
  const legacy = content.image_url?.trim();
  return legacy ? [legacy] : [];
}

export function heroSlideshowSettings(content: Pick<HeroContent, "slideshow">): HeroSlideshowSettings {
  return { ...DEFAULT_HERO_SLIDESHOW, ...content.slideshow };
}

export function isSectionEmpty(section: { component_type: string; content: Record<string, unknown> }): boolean {
  const type = section.component_type;
  const content = section.content;

  switch (type) {
    case "banner": {
      const c = content as unknown as BannerContent;
      return !c.heading?.trim() && !c.subheading?.trim() && !c.body?.trim() && !c.image_url?.trim();
    }
    case "hero": {
      const c = content as unknown as HeroContent;
      const images = heroBackgroundImages(c);
      return (
        !c.heading?.trim() &&
        !c.heading_suffix?.trim() &&
        !c.body?.trim() &&
        images.length === 0 &&
        !c.video_url?.trim()
      );
    }
    case "buttons": {
      const c = content as unknown as ButtonsContent;
      const buttons = (c.buttons ?? []).filter((item) => item.label?.trim() && item.url?.trim());
      return buttons.length === 0 && !c.heading?.trim() && !c.body?.trim();
    }
    case "table": {
      const c = content as unknown as TableContent;
      const columns = (c.columns ?? []).filter((col) => col.trim());
      const rows = (c.rows ?? []).filter((row) => row.some((cell) => cell.trim()));
      return columns.length === 0 && rows.length === 0 && !c.heading?.trim() && !c.body?.trim();
    }
    case "tabs": {
      const c = content as unknown as TabsContent;
      const tabs = (c.tabs ?? []).filter((tab) => tab.label?.trim());
      return tabs.length === 0 && !c.heading?.trim() && !c.body?.trim();
    }
    case "text": {
      const c = content as unknown as TextContent;
      return !c.heading?.trim() && !c.body?.trim();
    }
    case "gallery": {
      const c = content as unknown as GalleryContent;
      const images = (c.images ?? []).filter((img) => img.url?.trim());
      return images.length === 0 && !c.heading?.trim() && !c.body?.trim();
    }
    case "faq": {
      const c = content as unknown as FaqContent;
      const items = (c.items ?? []).filter((item) => item.question?.trim() && item.answer?.trim());
      return items.length === 0 && !c.heading?.trim();
    }
    case "video": {
      const c = content as unknown as VideoContent;
      return !resolveVideoEmbed(c.video_url ?? "") && !c.heading?.trim() && !c.body?.trim();
    }
    case "cards": {
      const c = content as unknown as CardsContent;
      const items = (c.items ?? []).filter((item) => item.title?.trim() || item.description?.trim());
      return items.length === 0 && !c.heading?.trim() && !c.body?.trim();
    }
    case "stats": {
      const c = content as unknown as StatsContent;
      const items = (c.items ?? []).filter((item) => item.label?.trim() && item.value?.trim());
      return items.length === 0 && !c.heading?.trim();
    }
    case "inclusions": {
      const c = content as unknown as InclusionsContent;
      const included = (c.included ?? []).filter((item) => item.trim());
      const excluded = (c.excluded ?? []).filter((item) => item.trim());
      return included.length === 0 && excluded.length === 0 && !c.heading?.trim();
    }
    case "itinerary": {
      const c = content as unknown as ItineraryContent;
      const items = (c.items ?? []).filter((item) => item.title?.trim());
      return items.length === 0 && !c.heading?.trim() && !c.cost_body?.trim();
    }
    case "catalog": {
      const c = content as unknown as CatalogContent;
      return !c.vertical;
    }
    case "testimonials": {
      const c = content as unknown as TestimonialsContent;
      const items = (c.items ?? []).filter((item) => item.quote?.trim() && item.author?.trim());
      return items.length === 0 && !c.heading?.trim();
    }
    case "map": {
      const c = content as unknown as MapContent;
      return !c.embed_url?.trim() && !c.address?.trim() && !c.heading?.trim() && !c.body?.trim();
    }
    case "forms": {
      const c = content as unknown as FormsContent;
      const fields = (c.fields ?? []).filter((field) => field.label?.trim());
      return fields.length === 0 && !c.heading?.trim() && !c.body?.trim();
    }
    default:
      return !String(content.heading ?? "").trim() && !String(content.body ?? "").trim();
  }
}
