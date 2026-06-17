import Link from "next/link";
import { GraduationCap, Plane, ShoppingBag } from "lucide-react";
import type { EntryCard } from "@/lib/api";
import { cn } from "@/lib/utils";

const iconMap = {
  "graduation-cap": GraduationCap,
  "shopping-bag": ShoppingBag,
  plane: Plane,
} as const;

interface EntryCardsProps {
  cards: EntryCard[];
}

export function EntryCards({ cards }: EntryCardsProps) {
  return (
    <section id="divisions" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          Explore Evoke
        </h2>
        <p className="mt-3 text-lg text-zinc-600">
          Three divisions. One premium experience.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = iconMap[card.icon as keyof typeof iconMap] ?? GraduationCap;
          return (
            <Link
              key={card.slug}
              href={card.url}
              className={cn(
                "group relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 text-white shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl",
                card.gradient,
              )}
            >
              <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0" />
              <div className="relative">
                <Icon className="mb-4 h-10 w-10" />
                <h3 className="text-2xl font-bold">{card.title}</h3>
                <p className="mt-2 text-sm text-white/90">{card.description}</p>
                <span className="mt-6 inline-block text-sm font-medium underline-offset-4 group-hover:underline">
                  Explore →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
