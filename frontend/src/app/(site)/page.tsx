import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/hero-section";
import { HomepageExtraSections } from "@/components/home/homepage-extra-sections";
import { SiteAdBanner } from "@/components/site/site-ad-banner";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient } from "@/lib/api";
import { defaultHomepageFallback } from "@/lib/homepage-defaults";
import { parseHomepageMeta } from "@/lib/homepage-meta";

const StatsBar = dynamic(() =>
  import("@/components/home/stats-bar").then((m) => ({ default: m.StatsBar })),
);

const EntryCards = dynamic(() =>
  import("@/components/home/entry-cards").then((m) => ({ default: m.EntryCards })),
);

const FeaturesSection = dynamic(() =>
  import("@/components/home/features-section").then((m) => ({ default: m.FeaturesSection })),
);

export default async function HomePage() {
  let homepage = null;

  try {
    const response = await apiClient.getHomepage();
    homepage = response.data;
  } catch {
    homepage = defaultHomepageFallback;
  }

  if (!homepage) {
    return <PageLoading label="Loading platform content..." />;
  }

  const meta = parseHomepageMeta(homepage.meta);

  return (
    <>
      <HeroSection hero={homepage.hero} />
      <div className="app-shell-x deferred-section py-6">
        <SiteAdBanner placement="homepage" />
      </div>
      <div className="deferred-section">
        <StatsBar items={meta.stats?.items} enabled={meta.stats?.enabled} />
      </div>
      <div className="deferred-section">
        <EntryCards cards={homepage.entry_cards} />
      </div>
      <div className="deferred-section">
        <FeaturesSection
          eyebrow={meta.features?.eyebrow}
          heading={meta.features?.heading}
          items={meta.features?.items}
          enabled={meta.features?.enabled}
        />
      </div>
      {meta.sections && meta.sections.length > 0 && (
        <div className="deferred-section">
          <HomepageExtraSections sections={meta.sections} />
        </div>
      )}
    </>
  );
}
