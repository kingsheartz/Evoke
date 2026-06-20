import type { HomepageData } from "@/lib/api";
import { defaultHomepageMeta } from "@/lib/homepage-meta";

/** Default hero video (editable in Admin → CMS → Homepage). */
export const DEFAULT_HERO_VIDEO = "/videos/EVOKE-videoplayback.mp4";

export const defaultHomepageFallback: HomepageData = {
  hero: {
    heading: "Welcome to EOKE Groups",
    subheading: "EVOKE Academy · EOKE Sports · EVOKE Tours",
    background_type: "video",
    background_url: null,
    video_url: DEFAULT_HERO_VIDEO,
    cta_text: "Explore Our World",
    cta_url: "#divisions",
  },
  entry_cards: [
    {
      slug: "academy",
      title: "EVOKE Academy",
      description: "Karate, Yoga, Swimming, Dance & more",
      icon: "graduation-cap",
      url: "/academy",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      slug: "shop",
      title: "EOKE Sports",
      description: "Equipment, apparel & fitness accessories",
      icon: "shopping-bag",
      url: "/shop",
      gradient: "from-emerald-600 to-teal-700",
    },
    {
      slug: "tours",
      title: "EVOKE Tours",
      description: "Domestic, international & adventure packages",
      icon: "plane",
      url: "/tours",
      gradient: "from-orange-600 to-rose-700",
    },
  ],
  meta: defaultHomepageMeta() as Record<string, unknown>,
};
