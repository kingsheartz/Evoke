import { SECTION_TYPES } from "@/lib/api";

export type SectionType = (typeof SECTION_TYPES)[number]["value"];

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
  itinerary: ItineraryContent;
  testimonials: TestimonialsContent;
  map: MapContent;
  forms: FormsContent;
};

export function isSectionType(value: string): value is SectionType {
  return SECTION_TYPES.some((t) => t.value === value);
}

export function defaultSectionContent(type: SectionType): Record<string, unknown> {
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
        items: [
          { label: "Duration", value: "5 Days – 6 Nights", icon: "clock" },
          { label: "Group size", value: "2–12", icon: "users" },
          { label: "Tour type", value: "Custom trip", icon: "compass" },
        ],
      };
    case "itinerary":
      return {
        heading: "Itinerary",
        cost_heading: "Cost",
        cost_body: "",
        items: [
          { title: "Day 01: Arrival", body: "", milestone: "start" },
          { title: "Day 02: Explore", body: "" },
          { title: "Day 06: Departure", body: "", milestone: "end" },
        ],
      };
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
