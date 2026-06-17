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
import { PageContainer } from "@/components/layout/app-shell";
import type { HomepageFeature } from "@/lib/homepage-meta";
import { defaultHomepageFeatures } from "@/lib/homepage-meta";

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

export function FeaturesSection({
  eyebrow = "Why Evoke",
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
    <section className="relative border-t border-app-border bg-app-surface/30 py-24">
      <PageContainer>
        <div className="mb-14 text-center">
          {eyebrow?.trim() && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">{eyebrow}</p>
          )}
          {heading?.trim() && (
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tighter text-app-text md:text-4xl">
              {heading}
            </h2>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon] ?? Sparkles;
            return (
              <div
                key={`${feature.title}-${i}`}
                className="group rounded-2xl border border-app-border bg-app-surface/80 p-6 transition-all duration-300 hover:border-accent/25 hover:bg-app-surface"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20 transition-all duration-300 group-hover:bg-accent/15 group-hover:ring-accent/30">
                  <Icon className="h-5 w-5 text-accent-soft" />
                </div>
                <h3 className="font-display text-lg font-semibold text-app-text">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-app-muted">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
