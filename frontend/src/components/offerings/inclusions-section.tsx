import { Check, X } from "lucide-react";
import type { InclusionsContent } from "@/lib/offerings";
import { cn } from "@/lib/utils";

type InclusionsSectionProps = InclusionsContent & {
  className?: string;
  compact?: boolean;
};

function normalizeList(values: string[] | undefined): string[] {
  return (values ?? []).map((item) => item.trim()).filter(Boolean);
}

export function InclusionsSection({
  heading = "Inclusions & Exclusions",
  included_label = "Inclusions",
  excluded_label = "Excludes",
  included,
  excluded,
  className,
  compact = false,
}: InclusionsSectionProps) {
  const includedItems = normalizeList(included);
  const excludedItems = normalizeList(excluded);

  if (includedItems.length === 0 && excludedItems.length === 0) return null;

  return (
    <section className={cn("mx-auto max-w-5xl px-4 sm:px-6", className)}>
      {heading?.trim() && (
        <h2 className="font-display text-2xl font-semibold tracking-tight text-app-text md:text-3xl">
          {heading}
        </h2>
      )}

      <div
        className={cn(
          "grid gap-6 md:grid-cols-2",
          heading?.trim() ? "mt-8" : undefined,
          compact && "gap-4",
        )}
      >
        {includedItems.length > 0 && (
          <InclusionColumn
            title={included_label}
            items={includedItems}
            tone="included"
            compact={compact}
          />
        )}
        {excludedItems.length > 0 && (
          <InclusionColumn
            title={excluded_label}
            items={excludedItems}
            tone="excluded"
            compact={compact}
          />
        )}
      </div>
    </section>
  );
}

function InclusionColumn({
  title,
  items,
  tone,
  compact,
}: {
  title: string;
  items: string[];
  tone: "included" | "excluded";
  compact?: boolean;
}) {
  const isIncluded = tone === "included";

  return (
    <div
      className={cn(
        "rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border",
        compact && "p-5",
      )}
    >
      <h3 className="font-display text-lg font-semibold text-app-text">{title}</h3>
      <ul className={cn("mt-4 space-y-3", compact && "space-y-2.5")}>
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm leading-relaxed text-app-muted">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                isIncluded ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
              )}
            >
              {isIncluded ? <Check className="h-3 w-3" strokeWidth={2.5} /> : <X className="h-3 w-3" strokeWidth={2.5} />}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
