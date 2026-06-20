import type { StatItem } from "@/lib/cms-sections";
import { resolveDivisionIcon } from "@/lib/division-page";
import { cn } from "@/lib/utils";

type StatsFactsBarProps = {
  items?: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
  bordered?: boolean;
};

export function StatsFactsBar({
  items,
  columns = 4,
  className,
  bordered = true,
}: StatsFactsBarProps) {
  const stats = (items ?? []).filter((item) => item.label?.trim() && item.value?.trim());
  if (stats.length === 0) return null;

  const gridClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-4";

  return (
    <section
      className={cn(
        bordered && "border-y border-app-border bg-app-surface/40",
        className,
      )}
    >
      <div className={cn("mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6", gridClass)}>
        {stats.map((item, index) => {
          const Icon = resolveDivisionIcon(item.icon ?? "clock");
          return (
            <div key={`${item.label}-${index}`} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-soft">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-app-muted">
                  {item.label}
                </p>
                <p className="mt-0.5 font-display text-base font-semibold text-app-text md:text-lg">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
