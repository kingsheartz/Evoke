"use client";

import type { HomepageData } from "@/lib/api";
import type { HomepageMeta } from "@/lib/homepage-meta";
import { EntryCards } from "@/components/home/entry-cards";
import { FeaturesSection } from "@/components/home/features-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomepageExtraSections } from "@/components/home/homepage-extra-sections";
import { StatsBar } from "@/components/home/stats-bar";
import { SiteAdBanner } from "@/components/site/site-ad-banner";

/** Classic homepage — hero video, division bento grid, stats, features. */
export function DefaultHome({
  homepage,
  meta,
}: {
  homepage: HomepageData;
  meta: HomepageMeta;
}) {
  return (
    <div className="default-home">
      <HeroSection hero={homepage.hero} scrollTarget="#divisions" />

      <div className="app-shell-x py-6">
        <SiteAdBanner placement="homepage" />
      </div>

      <StatsBar items={meta.stats?.items} enabled={meta.stats?.enabled} />

      <EntryCards cards={homepage.entry_cards} />

      <FeaturesSection
        eyebrow={meta.features?.eyebrow}
        heading={meta.features?.heading}
        items={meta.features?.items}
        enabled={meta.features?.enabled}
      />

      {meta.sections && meta.sections.length > 0 && (
        <HomepageExtraSections sections={meta.sections} />
      )}
    </div>
  );
}
