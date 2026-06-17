"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  GraduationCap,
  Plane,
  ShoppingBag,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/layout/page-illustration";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { usePrefersReducedMotion, useSaveData } from "@/hooks/use-media-preferences";
import type { HomepageData } from "@/lib/api";
import { DEFAULT_HERO_VIDEO } from "@/lib/homepage-defaults";

const divisionPills = [
  { label: "Academy", href: "/academy", icon: GraduationCap },
  { label: "Sports Shop", href: "/shop", icon: ShoppingBag },
  { label: "Tours", href: "/tours", icon: Plane },
];

interface HeroSectionProps {
  hero: HomepageData["hero"];
}

function accentHeading(heading: string) {
  const parts = heading.trim().split(/\s+/);
  if (parts.length <= 1) {
    return <span className="text-accent-soft">{heading}</span>;
  }
  const last = parts.pop()!;
  return (
    <>
      {parts.join(" ")}{" "}
      <span className="text-accent-soft">{last}</span>
    </>
  );
}

export function HeroSection({ hero }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef(0);
  const targetOffset = useRef({ x: 0, y: 0 });

  const [muted, setMuted] = useState(true);
  const [loadVideo, setLoadVideo] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const saveData = useSaveData();

  const isVideo = hero.background_type === "video" && !saveData;
  const videoSrc = hero.video_url || DEFAULT_HERO_VIDEO;
  const isImage = hero.background_type === "image" && hero.background_url;
  const enableParallax = !reducedMotion && typeof window !== "undefined" && !("ontouchstart" in window);

  useEffect(() => {
    if (!isVideo) return;
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadVideo(true);
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.15, rootMargin: "80px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isVideo]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enableParallax) return;
      const rect = e.currentTarget.getBoundingClientRect();
      targetOffset.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 12,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 8,
      };
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const el = contentRef.current;
        if (!el) return;
        const { x, y } = targetOffset.current;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    },
    [enableParallax],
  );

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      onMouseMove={onMouseMove}
    >
      {isVideo ? (
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className={reducedMotion ? "absolute inset-0 h-full w-full object-cover" : "hero-video-kenburns absolute inset-0 h-full w-full object-cover"}
          >
            {loadVideo && <source src={videoSrc} type="video/mp4" />}
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-app-bg/70 via-app-bg/50 to-app-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,13,15,0.4)_100%)]" />
        </div>
      ) : isImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.background_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-app-bg/70 via-app-bg/50 to-app-bg" />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 mesh-bg" />
          {!reducedMotion && <AmbientGlow />}
          {!reducedMotion && <HeroIllustration />}
          <div className="absolute inset-0 bg-gradient-to-b from-app-bg/40 via-app-bg/20 to-app-bg" />
        </>
      )}

      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-5xl page-container pt-28 pb-28 text-center will-change-transform"
      >
        <div className="animate-fade-up mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            {!reducedMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Premium Multi-Business Platform
        </div>

        <h1 className="animate-fade-up-delay-1 font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.25rem]">
          {accentHeading(hero.heading ?? "Welcome to Evoke")}
        </h1>

        {hero.subheading && (
          <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            {hero.subheading}
          </p>
        )}

        <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-2">
          {divisionPills.map((pill) => (
            <Link
              key={pill.href}
              href={pill.href}
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-sm text-white backdrop-blur-md transition-colors duration-300 hover:border-accent/40 hover:bg-accent/15 hover:text-white"
            >
              <pill.icon className="h-4 w-4 text-accent-soft transition-transform duration-300 group-hover:scale-110" />
              {pill.label}
            </Link>
          ))}
        </div>

        <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {hero.cta_text && hero.cta_url && (
            <Button asChild size="lg" variant="glow" className="min-w-[200px]">
              <Link href={hero.cta_url}>
                {hero.cta_text}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-w-[200px] border-white/15 bg-white/5 text-white backdrop-blur-md hover:border-white/25 hover:bg-white/10"
          >
            <Link href="/academy">Explore Academy</Link>
          </Button>
        </div>
      </div>

      {isVideo && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute right-6 top-28 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/55 hover:text-white"
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}

      <a
        href="#divisions"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/80 transition-colors hover:text-accent-soft"
        aria-label="Scroll to divisions"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className={`h-5 w-5 ${reducedMotion ? "" : "animate-float"}`} />
      </a>
    </section>
  );
}
