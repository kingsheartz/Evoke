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
import { useBrand } from "@/components/providers/brand-provider";
import type { HomepageData } from "@/lib/api";
import { DEFAULT_HERO_VIDEO } from "@/lib/homepage-defaults";
import { usePrefersReducedMotion, useSaveData } from "@/hooks/use-media-preferences";
import { HolographicCard } from "@/components/home/immersive/holographic-card";
import { cn } from "@/lib/utils";

const divisionPills = [
  { label: "EVOKE Academy", href: "/academy", icon: GraduationCap, glow: "cyan" as const },
  { label: "EOKE Sports", href: "/shop", icon: ShoppingBag, glow: "emerald" as const },
  { label: "EVOKE Tours", href: "/tours", icon: Plane, glow: "rose" as const },
];

export function ImmersiveHero({ hero }: { hero: HomepageData["hero"] }) {
  const brand = useBrand();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [loadVideo, setLoadVideo] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const saveData = useSaveData();

  const isVideo = hero.background_type === "video" && !saveData;
  const videoSrc = hero.video_url || DEFAULT_HERO_VIDEO;
  const isImage = hero.background_type === "image" && hero.background_url;

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

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }, []);

  const heading = hero.heading?.trim() || `Welcome to ${brand.name}`;
  const words = heading.split(/\s+/);
  const accentWord = words.length > 1 ? words.pop()! : null;
  const headingLead = accentWord ? words.join(" ") : heading;

  return (
    <section ref={sectionRef} className="immersive-hero relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      {isVideo ? (
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          >
            {loadVideo && <source src={videoSrc} type="video/mp4" />}
          </video>
        </div>
      ) : isImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${hero.background_url})` }}
        />
      ) : null}

      <div className="immersive-hero__grid absolute inset-0" aria-hidden />
      <div className="immersive-hero__letterbox immersive-hero__letterbox--top" aria-hidden />
      <div className="immersive-hero__letterbox immersive-hero__letterbox--bottom" aria-hidden />

      <div className="immersive-hud immersive-hud--tl" aria-hidden>
        <span className="immersive-hud__label">EOKE NETWORK</span>
        <span className="immersive-hud__value immersive-hud__pulse">ONLINE</span>
      </div>
      <div className="immersive-hud immersive-hud--tr" aria-hidden>
        <span className="immersive-hud__label">SECTOR</span>
        <span className="immersive-hud__value">ACADEMY · SPORTS · TOURS</span>
      </div>

      <div className="immersive-hero__content immersive-hero__content--booted relative z-10 mx-auto w-full max-w-5xl px-4 pt-28 pb-32 text-center sm:px-6">
        <HolographicCard className="immersive-hero__frame mx-auto max-w-4xl" glow="violet" depth={0.6}>
          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <div className="immersive-hero__badge mx-auto mb-6 inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {!reducedMotion && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]" />
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-cyan-200/90">
                Enter the EOKE universe
              </span>
            </div>

            <h1 className="immersive-hero__title font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              {accentWord ? (
                <>
                  {headingLead}{" "}
                  <span className="immersive-text-glow text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-cyan-200 to-fuchsia-300">
                    {accentWord}
                  </span>
                </>
              ) : (
                <span className="immersive-text-glow text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-cyan-200 to-fuchsia-300">
                  {heading}
                </span>
              )}
            </h1>

            {brand.tagline?.trim() && (
              <p className="mt-4 font-display text-lg italic tracking-wide text-white/75 md:text-xl">
                {brand.tagline}
              </p>
            )}

            {hero.subheading && (
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
                {hero.subheading}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {divisionPills.map((pill, i) => (
                <Link
                  key={pill.href}
                  href={pill.href}
                  className="immersive-pill group immersive-pill--enter"
                  style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                >
                  <pill.icon className="h-4 w-4 text-cyan-300/90 transition-transform duration-300 group-hover:scale-110" />
                  {pill.label}
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {hero.cta_text && hero.cta_url && (
                <Button asChild size="lg" variant="glow" className="immersive-cta min-w-[200px]">
                  <Link href={hero.cta_url}>
                    {hero.cta_text}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="immersive-cta-ghost min-w-[200px]">
                <Link href="/academy">Explore EVOKE Academy</Link>
              </Button>
            </div>
          </div>
        </HolographicCard>
      </div>

      {isVideo && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute right-6 top-28 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/25 bg-black/50 text-white backdrop-blur-md transition-colors hover:border-cyan-300/50 hover:bg-black/65"
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}

      <a
        href="#divisions"
        className="immersive-scroll-hint absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1"
        aria-label="Scroll to divisions"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-200/70">Descend</span>
        <ChevronDown className={cn("h-5 w-5 text-cyan-300/80", !reducedMotion && "animate-float")} />
      </a>
    </section>
  );
}
