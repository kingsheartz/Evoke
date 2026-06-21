import { defaultSectionContent, HERO_BACKGROUND_EXAMPLES, type SectionType } from "@/lib/cms-sections";
import type { SectionDefaultsDivision } from "@/lib/cms-sections";
import { apiClient } from "@/lib/api";

export type CmsPagePresetId = "blank" | "shop-landing" | "academy-landing" | "travel-landing";

export interface CmsPagePreset {
  id: CmsPagePresetId;
  label: string;
  description: string;
  pageType: string;
  division?: SectionDefaultsDivision;
  sections: Array<{ type: SectionType; content?: Record<string, unknown> }>;
}

function heroForDivision(division: SectionDefaultsDivision): Record<string, unknown> {
  const base = defaultSectionContent("hero", { division }) as Record<string, unknown>;

  switch (division) {
    case "shop":
      return {
        ...base,
        eyebrow: "EVOKE SHOP",
        heading: "GEAR UP",
        heading_accent: "for",
        heading_suffix: "EVERY ADVENTURE.",
        body: "Curated outdoor equipment, apparel, and essentials — shipped to your door.",
        background_images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070&auto=format&fit=crop",
          HERO_BACKGROUND_EXAMPLES[1].url,
        ],
        buttons: [
          { label: "Browse products", url: "/shop/products", variant: "primary" },
          { label: "View cart", url: "/shop/cart", variant: "outline" },
        ],
      };
    case "academy":
      return {
        ...base,
        eyebrow: "EVOKE ACADEMY",
        heading: "LEARN",
        heading_accent: "from",
        heading_suffix: "THE BEST.",
        body: "Hands-on courses led by certified trainers — build skills that last a lifetime.",
        background_images: [
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
          HERO_BACKGROUND_EXAMPLES[0].url,
        ],
        buttons: [
          { label: "View courses", url: "/academy/courses", variant: "primary" },
          { label: "My enrollments", url: "/account/enrollments", variant: "outline" },
        ],
      };
    case "tours":
      return {
        ...base,
        eyebrow: "EVOKE TOURS",
        heading: "EXPLORE",
        heading_accent: "beyond",
        heading_suffix: "THE MAP.",
        body: "Small-group expeditions to mountains, coastlines, and hidden trails worldwide.",
        background_images: HERO_BACKGROUND_EXAMPLES.map((item) => item.url),
        buttons: [
          { label: "Browse packages", url: "/tours/packages", variant: "primary" },
          { label: "Send enquiry", url: "/contact", variant: "outline" },
        ],
      };
  }
}

function presetSections(division: SectionDefaultsDivision): CmsPagePreset["sections"] {
  return [
    { type: "hero", content: heroForDivision(division) },
    { type: "catalog", content: defaultSectionContent("catalog", { division }) },
    { type: "stats", content: defaultSectionContent("stats", { division }) },
    {
      type: "cards",
      content: {
        heading: division === "shop" ? "Why shop with us" : division === "academy" ? "Why learn with us" : "Why travel with us",
        body: "",
        items:
          division === "shop"
            ? [
                { title: "Quality gear", description: "Products tested by our expedition team.", icon: "shield" },
                { title: "Fast delivery", description: "Ships within 2–5 business days across India.", icon: "truck" },
                { title: "Easy returns", description: "30-day return policy on unused items.", icon: "refresh" },
              ]
            : division === "academy"
              ? [
                  { title: "Certified trainers", description: "Learn from industry professionals.", icon: "award" },
                  { title: "Flexible batches", description: "Weekend and weekday schedules available.", icon: "calendar" },
                  { title: "Certificates", description: "Earn credentials upon completion.", icon: "file" },
                ]
              : [
                  { title: "Small groups", description: "Intimate groups for a personal experience.", icon: "users" },
                  { title: "Expert guides", description: "Local knowledge and safety-first approach.", icon: "compass" },
                  { title: "All-inclusive", description: "Transparent pricing with no hidden fees.", icon: "check" },
                ],
      },
    },
    ...(division === "tours"
      ? [
          { type: "inclusions" as SectionType, content: defaultSectionContent("inclusions", { division }) },
          { type: "itinerary" as SectionType, content: defaultSectionContent("itinerary", { division }) },
        ]
      : []),
    {
      type: "faq",
      content: {
        heading: "Frequently asked questions",
        style: "details",
        items:
          division === "shop"
            ? [
                { question: "How long does delivery take?", answer: "Most orders arrive within 3–7 business days." },
                { question: "Can I return an item?", answer: "Yes — unused items can be returned within 30 days." },
              ]
            : division === "academy"
              ? [
                  { question: "Do I need prior experience?", answer: "Most beginner courses require no prior experience." },
                  { question: "Are certificates included?", answer: "Yes — certificates are issued upon successful completion." },
                ]
              : [
                  { question: "What's included in the price?", answer: "Accommodation, meals, and guided activities as listed." },
                  { question: "How do I book?", answer: "Choose a package, select dates, and confirm online or via enquiry." },
                ],
      },
    },
    {
      type: "buttons",
      content: {
        heading: division === "shop" ? "Ready to shop?" : division === "academy" ? "Start learning today" : "Plan your trip",
        body: "",
        align: "center",
        buttons: [
          {
            label:
              division === "shop"
                ? "Browse all products"
                : division === "academy"
                  ? "View all courses"
                  : "Browse all packages",
            url:
              division === "shop" ? "/shop/products" : division === "academy" ? "/academy/courses" : "/tours/packages",
            variant: "primary",
          },
        ],
      },
    },
  ];
}

export const CMS_PAGE_PRESETS: CmsPagePreset[] = [
  {
    id: "blank",
    label: "Blank page",
    description: "Empty page — add sections manually in the builder.",
    pageType: "page",
    sections: [],
  },
  {
    id: "shop-landing",
    label: "Shop landing",
    description: "Hero, product catalog, stats, highlights, and FAQ for e-commerce.",
    pageType: "landing",
    division: "shop",
    sections: presetSections("shop"),
  },
  {
    id: "academy-landing",
    label: "Academy landing",
    description: "Hero, course catalog, stats, highlights, and FAQ for training.",
    pageType: "landing",
    division: "academy",
    sections: presetSections("academy"),
  },
  {
    id: "travel-landing",
    label: "Travel landing",
    description: "Hero, packages, inclusions, itinerary, stats, and FAQ for tours.",
    pageType: "landing",
    division: "tours",
    sections: presetSections("tours"),
  },
];

export function getCmsPagePreset(id: CmsPagePresetId): CmsPagePreset {
  return CMS_PAGE_PRESETS.find((preset) => preset.id === id) ?? CMS_PAGE_PRESETS[0];
}

export async function applyCmsPagePreset(
  token: string,
  pageId: number,
  presetId: CmsPagePresetId,
): Promise<void> {
  const preset = getCmsPagePreset(presetId);
  for (let index = 0; index < preset.sections.length; index++) {
    const section = preset.sections[index];
    const content = section.content ?? defaultSectionContent(section.type, { division: preset.division });
    await apiClient.createPageSection(token, pageId, {
      component_type: section.type,
      content,
      is_visible: true,
    });
  }
}
