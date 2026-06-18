import { PageContainer } from "@/components/layout/app-shell";
import type { HomepageStat } from "@/lib/homepage-meta";
import { defaultHomepageStats } from "@/lib/homepage-meta";

export function StatsBar({
  items,
  enabled = true,
}: {
  items?: HomepageStat[];
  enabled?: boolean;
}) {
  if (!enabled) return null;

  const stats = items?.length ? items : defaultHomepageStats;

  return (
    <section className="border-y border-app-border bg-app-surface/40 py-12">
      <PageContainer className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={`${stat.label}-${stat.value}`} className="text-center">
            <p className="font-display text-3xl font-semibold tracking-tight text-app-text md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-app-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </PageContainer>
    </section>
  );
}
