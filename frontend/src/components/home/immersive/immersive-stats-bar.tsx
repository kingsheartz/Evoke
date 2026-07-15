"use client";

import type { HomepageStat } from "@/lib/homepage-meta";
import { defaultHomepageStats } from "@/lib/homepage-meta";
import { HolographicCard } from "@/components/home/immersive/holographic-card";

export function ImmersiveStatsBar({
  items,
  enabled = true,
}: {
  items?: HomepageStat[];
  enabled?: boolean;
}) {
  if (!enabled) return null;

  const stats = items?.length ? items : defaultHomepageStats;

  return (
    <section className="immersive-section relative py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={`${stat.label}-${stat.value}`}
              className="immersive-card-enter"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <HolographicCard glow="violet" depth={0.4} className="text-center">
              <div className="px-4 py-6">
                <p className="font-display text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200/80 md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                  {stat.label}
                </p>
              </div>
            </HolographicCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
