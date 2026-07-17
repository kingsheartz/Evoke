"use client";

import { useCallback, useMemo, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionChapterArt } from "@/components/home/motion/motion-chapter-art";
import {
  chapterOpacity,
  chapterProgress,
  easeInOutCubic,
  useScrollProgress,
} from "@/hooks/use-scroll-progress";
import { usePrefersReducedMotion } from "@/hooks/use-media-preferences";
import {
  motionChapterAccentClass,
  motionChapterIndexLabel,
  motionChapterPanelClass,
  normalizeMotionChapters,
  type MotionChapter,
} from "@/lib/homepage-meta";
import { cn } from "@/lib/utils";

export function MotionScrollJourney({ chapters: chaptersInput }: { chapters?: MotionChapter[] }) {
  const chapters = useMemo(() => normalizeMotionChapters(chaptersInput), [chaptersInput]);
  const chapterCount = Math.max(1, chapters.length);
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const applyMotion = useCallback(
    (progress: number) => {
      let topPanel = 0;
      let topOpacity = 0;

      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const opacity = chapterOpacity(progress, i, chapterCount, 0.2);
        const local = chapterProgress(progress, i, chapterCount);
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
        const local = chapterProgress(progress, i, chapterCount);
        const pulse = easeInOutCubic(local);
        art.style.setProperty("--chapter", String(local));
        art.style.setProperty("--pulse", String(pulse));
        art.style.opacity = String(chapterOpacity(progress, i, chapterCount, 0.22));
      });

      dotFillRefs.current.forEach((fill, i) => {
        if (!fill) return;
        fill.style.width = `${chapterProgress(progress, i, chapterCount) * 100}%`;
      });
    },
    [chapterCount],
  );

  useScrollProgress(sectionRef, applyMotion, !reducedMotion, 0.32);

  return (
    <section
      id="motion-journey"
      ref={sectionRef}
      className="motion-journey"
      aria-label="Our divisions"
      style={{ "--motion-chapter-count": chapterCount } as CSSProperties}
    >
      <div className="motion-journey__pin">
        {chapters.map((chapter, i) => (
          <article
            key={chapter.id}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={cn("motion-journey__panel", motionChapterPanelClass(chapter.art_theme))}
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <span className={cn("motion-journey__index", motionChapterAccentClass(chapter.art_theme))} aria-hidden>
              {motionChapterIndexLabel(i)}
            </span>

            <div className="motion-journey__layout">
              <div className="motion-journey__copy">
                <p className="motion-journey__eyebrow">{chapter.eyebrow}</p>
                <h2 className="motion-journey__title">{chapter.title}</h2>
                <p className="motion-journey__desc">{chapter.description}</p>

                {chapter.tags.length > 0 && (
                  <ul className="motion-journey__tags">
                    {chapter.tags.map((tag) => (
                      <li key={tag} className="motion-journey__tag">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

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
                theme={chapter.art_theme}
                startIcon={chapter.start_icon}
                endIcon={chapter.end_icon}
                instanceKey={chapter.id}
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
            <div key={chapter.id} className={cn("motion-journey__nav-item", motionChapterAccentClass(chapter.art_theme))}>
              <span className="motion-journey__nav-index">{motionChapterIndexLabel(i)}</span>
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
