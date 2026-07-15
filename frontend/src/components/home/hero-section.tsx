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
import { useBrand } from "@/components/providers/brand-provider";
import type { HomepageData } from "@/lib/api";
import { DEFAULT_HERO_VIDEO } from "@/lib/homepage-defaults";
import { cn } from "@/lib/utils";

const divisionPills = [
  { label: "EVOKE Academy", href: "/academy", icon: GraduationCap },
  { label: "EOKE Sports", href: "/shop", icon: ShoppingBag },
  { label: "EVOKE Tours", href: "/tours", icon: Plane },
];

interface HeroSectionProps {
  hero: HomepageData["hero"];
  scrollTarget?: string;
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

export function HeroSection({ hero, scrollTarget = "#divisions" }: HeroSectionProps) {
  const brand = useBrand();
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
      className={cn(
        "hero-section relative flex min-h-[100svh] items-center justify-center overflow-hidden",
        (isVideo || isImage) && "hero-section--media",
      )}
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
          <div className="hero-media-scrim absolute inset-0" aria-hidden />
          <div className="hero-media-vignette absolute inset-0" aria-hidden />
        </div>
      ) : isImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.background_url})` }}
        >
          <div className="hero-media-scrim absolute inset-0" aria-hidden />
          <div className="hero-media-vignette absolute inset-0" aria-hidden />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 mesh-bg" />
          {!reducedMotion && <AmbientGlow />}
          {!reducedMotion && <HeroIllustration />}
          <div className="hero-mesh-scrim absolute inset-0" aria-hidden />
        </>
      )}

      <div
        ref={contentRef}
        className="hero-copy relative z-10 mx-auto w-full max-w-5xl page-container pt-28 pb-28 text-center will-change-transform"
      >
        <div className="hero-badge animate-fade-up mx-auto mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            {!reducedMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Premium Multi-Business Platform
        </div>

        <h1 className="hero-title animate-fade-up-delay-1 font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.25rem]">
          {accentHeading(hero.heading?.trim() || `Welcome to ${brand.name}`)}
        </h1>

        {brand.tagline?.trim() && (
          <p className="hero-tagline animate-fade-up-delay-2 mx-auto mt-4 max-w-xl font-display text-lg italic tracking-wide text-white/90 md:text-xl">
            {brand.tagline}
          </p>
        )}

        {hero.subheading && (
          <p className="hero-subtitle animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
            {hero.subheading}
          </p>
        )}

        <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-2">
          {divisionPills.map((pill) => (
            <Link
              key={pill.href}
              href={pill.href}
              className="hero-pill group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur-md transition-colors duration-300 hover:border-accent/40 hover:bg-accent/15"
            >
              <pill.icon className="hero-pill-icon h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
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
            className="hero-cta-ghost min-w-[200px] border backdrop-blur-md"
          >
            <Link href="/academy">Explore EVOKE Academy</Link>
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
        href={scrollTarget}
        className="hero-scroll-hint absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 transition-colors hover:text-accent-soft"
        aria-label="Scroll to next section"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className={`h-5 w-5 ${reducedMotion ? "" : "animate-float"}`} />
      </a>
    </section>
  );
}
