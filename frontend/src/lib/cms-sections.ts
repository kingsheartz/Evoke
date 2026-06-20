import { SECTION_TYPES } from "@/lib/api";
import type { TimelineVariant } from "@/lib/offerings";

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
  answer: string;
}

export interface CardItem {
  title: string;
  description: string;
  image_url?: string;
  icon?: string;
  link_url?: string;
  link_label?: string;
  price?: string;
  badge?: string;
  meta_line?: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
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
  value: string;
  icon?: string;
}

export interface StatsContent {
  heading?: string;
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
  cost_heading?: string;
  cost_body?: string;
  items?: ItineraryDay[];
  /** Controls timeline labels and milestone icons (travel, course, product). */
  variant?: TimelineVariant;
}

export interface InclusionsContent {
  heading?: string;
  included?: string[];
  excluded?: string[];
  included_label?: string;
  excluded_label?: string;
}

export interface BannerContent {
  heading?: string;
  subheading?: string;
  body?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
}

export interface TextContent {
  heading?: string;
  body?: string;
}

export interface GalleryContent {
  heading?: string;
  body?: string;
  columns?: 2 | 3 | 4;
  preview_limit?: number;
  images?: GalleryImage[];
}

export interface FaqContent {
  heading?: string;
  style?: "details" | "list";
  items?: FaqItem[];
}

export interface VideoContent {
  heading?: string;
  body?: string;
  video_url?: string;
  caption?: string;
}

export interface CardsContent {
  heading?: string;
  body?: string;
  items?: CardItem[];
}

export interface TestimonialsContent {
  heading?: string;
  items?: TestimonialItem[];
}

export interface MapContent {
  heading?: string;
  body?: string;
  embed_url?: string;
  address?: string;
}

export interface FormsContent {
  heading?: string;
  body?: string;
  submit_label?: string;
  contact_email?: string;
  fields?: FormField[];
}

export type SectionContentByType = {
  banner: BannerContent;
  text: TextContent;
  gallery: GalleryContent;
  faq: FaqContent;
  video: VideoContent;
  cards: CardsContent;
  stats: StatsContent;
  inclusions: InclusionsContent;
  itinerary: ItineraryContent;
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

export function isSectionEmpty(section: { component_type: string; content: Record<string, unknown> }): boolean {
  const type = section.component_type;
  const content = section.content;

  switch (type) {
    case "banner": {
      const c = content as unknown as BannerContent;
      return !c.heading?.trim() && !c.subheading?.trim() && !c.body?.trim() && !c.image_url?.trim();
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
