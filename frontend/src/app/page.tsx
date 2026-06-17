import { EntryCards } from "@/components/home/entry-cards";
import { HeroSection } from "@/components/home/hero-section";
import { apiClient } from "@/lib/api";

export default async function HomePage() {
  let homepage = null;

  try {
    const response = await apiClient.getHomepage();
    homepage = response.data;
  } catch {
    homepage = {
      hero: {
        heading: "Welcome to Evoke",
        subheading: "Academy · Sports Shop · Tours & Travels",
        background_type: "gradient",
        background_url: null,
        video_url: null,
        cta_text: "Explore Our World",
        cta_url: "#divisions",
      },
      entry_cards: [
        {
          slug: "academy",
          title: "Evoke Academy",
          description: "Karate, Yoga, Swimming, Dance & more",
          icon: "graduation-cap",
          url: "/academy",
          gradient: "from-blue-600 to-indigo-700",
        },
        {
          slug: "shop",
          title: "Sports Shop",
          description: "Equipment, apparel & fitness accessories",
          icon: "shopping-bag",
          url: "/shop",
          gradient: "from-emerald-600 to-teal-700",
        },
        {
          slug: "tours",
          title: "Tours & Travels",
          description: "Domestic, international & adventure packages",
          icon: "plane",
          url: "/tours",
          gradient: "from-orange-600 to-rose-700",
        },
      ],
      meta: {},
    };
  }

  if (!homepage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-500">Loading platform content...</p>
      </div>
    );
  }

  return (
    <>
      <HeroSection hero={homepage.hero} />
      <EntryCards cards={homepage.entry_cards} />
    </>
  );
}
