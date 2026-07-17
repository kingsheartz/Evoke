"use client";

import type { HomepageData } from "@/lib/api";
import type { HomepageMeta } from "@/lib/homepage-meta";
import { FeaturesSection } from "@/components/home/features-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomepageExtraSections } from "@/components/home/homepage-extra-sections";
import { StatsBar } from "@/components/home/stats-bar";
import { MotionReveal } from "@/components/home/motion/motion-reveal";
import { MotionScrollJourney } from "@/components/home/motion/motion-scroll-journey";
import { SiteAdBanner } from "@/components/site/site-ad-banner";
import "./motion-home.css";

export function MotionHome({
  homepage,
  meta,
}: {
  homepage: HomepageData;
  meta: HomepageMeta;
}) {
  return (
    <div className="motion-home">
      <HeroSection hero={homepage.hero} scrollTarget="#motion-journey" />

      <MotionScrollJourney chapters={meta.motion?.chapters} />

      <div className="app-shell-x py-6">
        <SiteAdBanner placement="homepage" />
      </div>

      <MotionReveal delayMs={80}>
        <StatsBar items={meta.stats?.items} enabled={meta.stats?.enabled} />
      </MotionReveal>

      <MotionReveal delayMs={100}>
        <FeaturesSection
          eyebrow={meta.features?.eyebrow}
          heading={meta.features?.heading}
          items={meta.features?.items}
          enabled={meta.features?.enabled}
        />
      </MotionReveal>

      {meta.sections && meta.sections.length > 0 && (
        <MotionReveal delayMs={80}>
          <HomepageExtraSections sections={meta.sections} />
        </MotionReveal>
      )}
    </div>
  );
}
