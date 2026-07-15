"use client";

import { useEffect, useRef } from "react";
import type { HomepageData } from "@/lib/api";
import type { HomepageMeta } from "@/lib/homepage-meta";
import { HomepageExtraSections } from "@/components/home/homepage-extra-sections";
import { SiteAdBanner } from "@/components/site/site-ad-banner";
import { ImmersiveEntryCards } from "@/components/home/immersive/immersive-entry-cards";
import { ImmersiveFeaturesSection } from "@/components/home/immersive/immersive-features-section";
import { ImmersiveHero } from "@/components/home/immersive/immersive-hero";
import { ImmersiveStatsBar } from "@/components/home/immersive/immersive-stats-bar";
import { SciFiParticleField } from "@/components/home/immersive/sci-fi-particle-field";
import { usePrefersReducedMotion } from "@/hooks/use-media-preferences";
import "./immersive-home.css";

const LERP = 0.12;

export function ImmersiveHome({
  homepage,
  meta,
}: {
  homepage: HomepageData;
  meta: HomepageMeta;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const statsLayerRef = useRef<HTMLDivElement>(null);
  const cardsLayerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef({ hero: 0, stats: 0, cards: 0 });
  const targetRef = useRef({ hero: 0, stats: 0, cards: 0 });

  useEffect(() => {
    if (reducedMotion) return;

    const mobileMq = window.matchMedia("(max-width: 1023px)");
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    let raf = 0;
    let running = false;

    const apply = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.hero += (tgt.hero - cur.hero) * LERP;

      if (heroLayerRef.current) {
        heroLayerRef.current.style.transform = `translate3d(0, ${cur.hero}px, 0)`;
      }
      if (statsLayerRef.current) {
        statsLayerRef.current.style.transform = "translate3d(0, 0, 0)";
      }
      if (cardsLayerRef.current) {
        cardsLayerRef.current.style.transform = "translate3d(0, 0, 0)";
      }

      const stillMoving = Math.abs(tgt.hero - cur.hero) > 0.15;

      if (stillMoving) {
        raf = window.requestAnimationFrame(apply);
      } else {
        running = false;
        raf = 0;
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const parallaxEnabled = !mobileMq.matches && !isCoarsePointer;
      targetRef.current = {
        hero: parallaxEnabled ? y * 0.05 : 0,
        stats: 0,
        cards: 0,
      };
      if (!running) {
        running = true;
        raf = window.requestAnimationFrame(apply);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    mobileMq.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mobileMq.removeEventListener("change", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div className="immersive-home">
      <div className="immersive-home__backdrop" aria-hidden>
        <div className="immersive-home__nebula immersive-home__nebula--violet" />
        <div className="immersive-home__nebula immersive-home__nebula--cyan" />
        <div className="immersive-home__nebula immersive-home__nebula--rose" />
        <SciFiParticleField className="immersive-home__particles" opacity={0.85} defer />
        <div className="immersive-home__vignette" />
        <div className="immersive-home__noise" />
      </div>

      <div ref={heroLayerRef} className="immersive-home__layer immersive-home__layer--hero">
        <ImmersiveHero hero={homepage.hero} />
      </div>

      <div className="immersive-home__layer">
        <div className="app-shell-x py-6">
          <SiteAdBanner placement="homepage" />
        </div>
      </div>

      <div ref={statsLayerRef} className="immersive-home__layer immersive-home__layer--stats">
        <ImmersiveStatsBar items={meta.stats?.items} enabled={meta.stats?.enabled} />
      </div>

      <div ref={cardsLayerRef} className="immersive-home__layer immersive-home__layer--cards">
        <ImmersiveEntryCards cards={homepage.entry_cards} />
      </div>

      <div className="immersive-home__layer immersive-home__layer--features">
        <ImmersiveFeaturesSection
          eyebrow={meta.features?.eyebrow}
          heading={meta.features?.heading}
          items={meta.features?.items}
          enabled={meta.features?.enabled}
        />
      </div>

      {meta.sections && meta.sections.length > 0 && (
        <div className="immersive-home__layer immersive-home__cms border-t border-white/5">
          <HomepageExtraSections sections={meta.sections} />
        </div>
      )}
    </div>
  );
}
