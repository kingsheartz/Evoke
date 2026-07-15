"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionChapterArt, type ChapterId } from "@/components/home/motion/motion-chapter-art";
import {
  chapterOpacity,
  chapterProgress,
  easeInOutCubic,
  useScrollProgress,
} from "@/hooks/use-scroll-progress";
import { usePrefersReducedMotion } from "@/hooks/use-media-preferences";
import { cn } from "@/lib/utils";

const chapters = [
  {
    id: "academy" as const,
    index: "01",
    label: "Academy",
    eyebrow: "EVOKE Academy",
    title: "Train with purpose",
    desc: "Martial arts, yoga, swimming — structured programs led by coaches who care about progress.",
    href: "/academy",
    cta: "Browse courses",
    tags: ["Karate", "Yoga", "Swimming"],
    panelClass: "motion-journey__panel--academy",
    accentClass: "motion-journey__accent--academy",
  },
  {
    id: "sports" as const,
    index: "02",
    label: "Sports",
    eyebrow: "EOKE Sports",
    title: "Play at your peak",
    desc: "Gear, apparel, and equipment for athletes who show up — from training days to match day.",
    href: "/shop",
    cta: "Shop now",
    tags: ["Equipment", "Apparel", "Accessories"],
    panelClass: "motion-journey__panel--sports",
    accentClass: "motion-journey__accent--sports",
  },
  {
    id: "tours" as const,
    index: "03",
    label: "Tours",
    eyebrow: "EVOKE Tours",
    title: "Travel that moves you",
    desc: "Handpicked domestic and international journeys — adventure, culture, and memories in motion.",
    href: "/tours",
    cta: "View packages",
    tags: ["Domestic", "International", "Adventure"],
    panelClass: "motion-journey__panel--tours",
    accentClass: "motion-journey__accent--tours",
  },
] as const;

export function MotionScrollJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const applyMotion = useCallback((progress: number) => {
    let topPanel = 0;
    let topOpacity = 0;

    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const opacity = chapterOpacity(progress, i, 3, 0.2);
      const local = chapterProgress(progress, i);
      panel.style.opacity = String(opacity);
      panel.style.pointerEvents = opacity > 0.55 ? "auto" : "none";

      const copy = panel.querySelector<HTMLElement>(".motion-journey__copy");
      const index = panel.querySelector<HTMLElement>(".motion-journey__index");
      if (copy) {
        const enter = easeInOutCubic(Math.min(1, local * 2.2));
        copy.style.transform = `translate3d(0, ${(1 - enter) * 28}px, 0)`;
        copy.style.opacity = String(0.35 + enter * 0.65);
      }
      if (index) {
        const drift = easeInOutCubic(local);
        index.style.transform = `translate3d(${drift * -6}%, 0, 0)`;
        index.style.opacity = String(0.08 + local * 0.14);
      }

      if (opacity > topOpacity) {
        topOpacity = opacity;
        topPanel = i;
      }
    });

    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      panel.style.zIndex = String(i === topPanel ? 3 : 1);
    });

    artRefs.current.forEach((art, i) => {
      if (!art) return;
      const local = chapterProgress(progress, i);
      const pulse = easeInOutCubic(local);
      art.style.setProperty("--chapter", String(local));
      art.style.setProperty("--pulse", String(pulse));
      art.style.opacity = String(chapterOpacity(progress, i, 3, 0.22));
    });

    dotFillRefs.current.forEach((fill, i) => {
      if (!fill) return;
      fill.style.width = `${chapterProgress(progress, i) * 100}%`;
    });
  }, []);

  useScrollProgress(sectionRef, applyMotion, !reducedMotion, 0.32);

  return (
    <section id="motion-journey" ref={sectionRef} className="motion-journey" aria-label="Our divisions">
      <div className="motion-journey__pin">
        {chapters.map((chapter, i) => (
          <article
            key={chapter.id}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={cn("motion-journey__panel", chapter.panelClass)}
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <span className={cn("motion-journey__index", chapter.accentClass)} aria-hidden>
              {chapter.index}
            </span>

            <div className="motion-journey__layout">
              <div className="motion-journey__copy">
                <p className="motion-journey__eyebrow">{chapter.eyebrow}</p>
                <h2 className="motion-journey__title">{chapter.title}</h2>
                <p className="motion-journey__desc">{chapter.desc}</p>

                <ul className="motion-journey__tags">
                  {chapter.tags.map((tag) => (
                    <li key={tag} className="motion-journey__tag">
                      {tag}
                    </li>
                  ))}
                </ul>

                <div className="motion-journey__actions">
                  <Button asChild variant="glow" size="lg">
                    <Link href={chapter.href}>
                      {chapter.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Link href={chapter.href} className="motion-journey__ghost-link">
                    Explore division
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <MotionChapterArt
                chapter={chapter.id as ChapterId}
                ref={(el) => {
                  artRefs.current[i] = el;
                }}
                className="motion-journey__art"
              />
            </div>
          </article>
        ))}

        <nav className="motion-journey__nav" aria-label="Chapter progress">
          {chapters.map((chapter, i) => (
            <div key={chapter.id} className={cn("motion-journey__nav-item", chapter.accentClass)}>
              <span className="motion-journey__nav-index">{chapter.index}</span>
              <span className="motion-journey__nav-label">{chapter.label}</span>
              <span className="motion-journey__nav-track">
                <span
                  ref={(el) => {
                    dotFillRefs.current[i] = el;
                  }}
                  className="motion-journey__nav-fill"
                />
              </span>
            </div>
          ))}
        </nav>
      </div>
    </section>
  );
}
