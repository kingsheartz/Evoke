"use client";

import {
  Award,
  Globe,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { HomepageFeature } from "@/lib/homepage-meta";
import { defaultHomepageFeatures } from "@/lib/homepage-meta";
import { HolographicCard } from "@/components/home/immersive/holographic-card";

const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  users: Users,
  target: Target,
  globe: Globe,
  shield: Shield,
  award: Award,
  star: Star,
  zap: Zap,
};

const glowCycle: Array<"violet" | "cyan" | "emerald" | "rose"> = ["violet", "cyan", "emerald", "rose", "violet", "cyan"];

export function ImmersiveFeaturesSection({
  eyebrow = "Why EOKE",
  heading = "Built for excellence",
  items,
  enabled = true,
}: {
  eyebrow?: string;
  heading?: string;
  items?: HomepageFeature[];
  enabled?: boolean;
}) {
  if (!enabled) return null;

  const features = items?.length ? items : defaultHomepageFeatures;

  return (
    <section className="immersive-section immersive-section--features relative border-t border-white/5 py-20 md:py-28">
      <div className="immersive-section__depth immersive-section__depth--2" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          {eyebrow?.trim() && (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/80">{eyebrow}</p>
          )}
          {heading?.trim() && (
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tighter text-white/95 md:text-4xl">
              {heading}
            </h2>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon] ?? Sparkles;
            return (
              <div
                key={`${feature.title}-${i}`}
                className="immersive-card-enter"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
              <HolographicCard glow={glowCycle[i % glowCycle.length]} depth={0.8} className="group h-full">
                <div className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-[0_0_20px_rgba(93,93,255,0.2)] backdrop-blur-sm transition-all duration-300 group-hover:border-cyan-400/30 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.25)]">
                    <Icon className="h-5 w-5 text-cyan-200/90" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white/95">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{feature.description}</p>
                </div>
              </HolographicCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
