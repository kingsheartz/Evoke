"use client";

import Link from "next/link";
import { ArrowUpRight, GraduationCap, Plane, ShoppingBag } from "lucide-react";
import type { EntryCard } from "@/lib/api";
import { HolographicCard } from "@/components/home/immersive/holographic-card";
import { gradientBackgroundStyle } from "@/lib/gradients";
import { cn } from "@/lib/utils";

const iconMap = {
  "graduation-cap": GraduationCap,
  "shopping-bag": ShoppingBag,
  plane: Plane,
} as const;

const glowMap: Record<string, "cyan" | "emerald" | "rose"> = {
  academy: "cyan",
  shop: "emerald",
  tours: "rose",
};

const bentoLayout: Record<string, string> = {
  academy: "md:col-span-2 md:row-span-2",
  shop: "md:col-span-1",
  tours: "md:col-span-1",
};

const fallbackGradients: Record<string, string> = {
  academy: "from-blue-600 to-indigo-700",
  shop: "from-emerald-600 to-teal-700",
  tours: "from-orange-600 to-rose-700",
};

export function ImmersiveEntryCards({ cards }: { cards: EntryCard[] }) {
  return (
    <section id="divisions" className="immersive-section immersive-section--divisions relative py-20 pb-28 md:py-28 md:pb-28">
      <div className="immersive-section__depth immersive-section__depth--1" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Division portals</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tighter md:text-5xl">
            <span className="text-white/95">Three worlds.</span>{" "}
            <span className="immersive-text-glow text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-cyan-300">
              One universe.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/50">
            EVOKE Academy, EOKE Sports, and EVOKE Tours — holographic gateways into the EOKE ecosystem.
          </p>
        </div>

        <div className="grid auto-rows-[minmax(200px,auto)] gap-5 sm:gap-6 md:grid-cols-3 md:grid-rows-2">
          {cards.map((card, i) => {
            const Icon = iconMap[card.icon as keyof typeof iconMap] ?? GraduationCap;
            const layout = bentoLayout[card.slug] ?? "";
            const glow = glowMap[card.slug] ?? "cyan";
            const gradientValue =
              card.gradient?.trim() || fallbackGradients[card.slug] || "from-blue-600 to-indigo-700";
            const gradientStyle = gradientBackgroundStyle(gradientValue);

            return (
              <Link
                key={card.slug}
                href={card.url}
                className={cn("group block", layout, "immersive-card-enter")}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <HolographicCard glow={glow} depth={1.2} className="h-full min-h-[200px]">
                  <div className="relative flex h-full min-h-[200px] flex-col overflow-hidden p-7 md:p-8">
                    <div
                      className="absolute inset-0 opacity-50 transition-opacity duration-500 group-hover:opacity-70"
                      style={gradientStyle}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent" />

                    <div className="relative flex h-full flex-col">
                      <div className="mb-auto flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 shadow-[0_0_24px_rgba(34,211,238,0.15)] backdrop-blur-md">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-cyan-200/70 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-100" />
                      </div>

                      <div className="mt-8">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                          Portal {String(i + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">{card.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{card.description}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-200/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          Initialize
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </HolographicCard>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
