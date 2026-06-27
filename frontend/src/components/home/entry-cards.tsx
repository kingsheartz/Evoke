import Link from "next/link";
import { ArrowUpRight, GraduationCap, Plane, ShoppingBag } from "lucide-react";
import type { EntryCard } from "@/lib/api";
import { PageContainer } from "@/components/layout/app-shell";
import { gradientBackgroundStyle } from "@/lib/gradients";
import { cn } from "@/lib/utils";

const iconMap = {
  "graduation-cap": GraduationCap,
  "shopping-bag": ShoppingBag,
  plane: Plane,
} as const;

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

interface EntryCardsProps {
  cards: EntryCard[];
}

export function EntryCards({ cards }: EntryCardsProps) {
  return (
    <section id="divisions" className="relative w-full py-24">
      <PageContainer>
      <div className="mb-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">Our Divisions</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tighter text-app-text md:text-5xl">
          Three worlds. <span className="text-accent-soft">One experience.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-app-muted">
          EVOKE Academy, EOKE Sports, and EVOKE Tours — unified under EOKE Groups.
        </p>
      </div>

      <div className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-3 md:grid-rows-2">
        {cards.map((card, i) => {
          const Icon = iconMap[card.icon as keyof typeof iconMap] ?? GraduationCap;
          const layout = bentoLayout[card.slug] ?? "";
          const gradientValue =
            card.gradient?.trim() || fallbackGradients[card.slug] || "from-blue-600 to-indigo-700";
          const gradientStyle = gradientBackgroundStyle(gradientValue);

          return (
            <Link
              key={card.slug}
              href={card.url}
              className={cn(
                "group relative overflow-hidden rounded-2xl glass-card p-8 transition-all duration-500 hover:-translate-y-1",
                layout,
                i === 0 && "animate-fade-up",
                i === 1 && "animate-fade-up-delay-1",
                i === 2 && "animate-fade-up-delay-2",
              )}
            >
              <div
                className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-80"
                style={gradientStyle}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-app-bg/50 to-app-bg/20" />

              <div className="relative flex h-full flex-col">
                <div className="mb-auto flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/80 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                </div>

                <div className="mt-8">
                  <h3 className="font-display text-2xl font-bold text-white md:text-3xl">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">{card.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore division
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      </PageContainer>
    </section>
  );
}
