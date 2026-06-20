"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, MapPin, Package } from "lucide-react";
import type { TimelineContent, TimelineVariant } from "@/lib/offerings";
import { timelineVariantLabels } from "@/lib/offerings";
import { cn } from "@/lib/utils";

type TimelineSectionProps = TimelineContent & {
  className?: string;
  defaultOpenIndex?: number;
};

function milestoneIcon(variant: TimelineVariant) {
  switch (variant) {
    case "course":
      return BookOpen;
    case "product":
      return Package;
    default:
      return MapPin;
  }
}

export function TimelineSection({
  heading,
  cost_heading,
  cost_body,
  items,
  variant = "travel",
  className,
  defaultOpenIndex = 0,
}: TimelineSectionProps) {
  const labels = timelineVariantLabels(variant);
  const timelineItems = (items ?? []).filter((item) => item.title?.trim());
  const hasCost = Boolean(cost_body?.trim());
  const [tab, setTab] = useState<"timeline" | "cost">("timeline");
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ [defaultOpenIndex]: true });

  if (timelineItems.length === 0 && !hasCost) return null;

  const MilestoneIcon = milestoneIcon(variant);

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !(prev[index] ?? false),
    }));
  };

  return (
    <section className={cn("mx-auto max-w-3xl px-4 sm:px-6", className)}>
      {(heading?.trim() || hasCost) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-app-border">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setTab("timeline")}
              className={cn(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                tab === "timeline"
                  ? "border-accent text-app-text"
                  : "border-transparent text-app-muted hover:text-app-text",
              )}
            >
              {heading?.trim() || labels.heading}
            </button>
            {hasCost && (
              <button
                type="button"
                onClick={() => setTab("cost")}
                className={cn(
                  "border-b-2 pb-3 text-sm font-medium transition-colors",
                  tab === "cost"
                    ? "border-accent text-app-text"
                    : "border-transparent text-app-muted hover:text-app-text",
                )}
              >
                {cost_heading?.trim() || labels.costHeading}
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "cost" && hasCost ? (
        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-app-muted">
          {cost_body}
        </div>
      ) : (
        <div className="relative">
          {timelineItems.length > 1 && (
            <div className="mb-3 flex justify-end gap-2">
              <button
                type="button"
                className="text-xs font-medium text-app-muted transition-colors hover:text-accent-soft"
                onClick={() =>
                  setOpenItems(Object.fromEntries(timelineItems.map((_, index) => [index, true])))
                }
              >
                Expand all
              </button>
              <span className="text-app-border" aria-hidden>
                |
              </span>
              <button
                type="button"
                className="text-xs font-medium text-app-muted transition-colors hover:text-accent-soft"
                onClick={() => setOpenItems({})}
              >
                Collapse all
              </button>
            </div>
          )}

          <div
            className="pointer-events-none absolute bottom-4 left-4.5 top-4 w-px -translate-x-1/2 border-l border-dashed border-app-border/90"
            aria-hidden
          />

          <ol className="space-y-2">
            {timelineItems.map((item, index) => {
              const isStart =
                item.milestone === "start" || (item.milestone !== "end" && index === 0);
              const isEnd =
                item.milestone === "end" ||
                (item.milestone !== "start" && index === timelineItems.length - 1);
              const isMilestone = isStart || isEnd;
              const isOpen = openItems[index] ?? false;

              return (
                <li
                  key={`${item.title}-${index}`}
                  className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4"
                >
                  <div className="relative flex justify-center pt-3.5">
                    <span
                      className={cn(
                        "relative z-1 flex shrink-0 items-center justify-center rounded-full bg-app-bg ring-4 ring-app-bg transition-colors",
                        isMilestone
                          ? "h-9 w-9 bg-accent/15 text-accent-soft shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                          : "h-3.5 w-3.5 border-2 border-accent/55 bg-app-surface",
                        isOpen && !isMilestone && "border-accent bg-accent/20",
                      )}
                    >
                      {isMilestone && <MilestoneIcon className="h-4 w-4" strokeWidth={2} />}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "min-w-0 overflow-hidden rounded-xl border transition-colors",
                      isOpen
                        ? "border-app-border bg-app-surface-muted/30 shadow-sm"
                        : "border-app-border/40 bg-app-surface/20 hover:border-app-border/70 hover:bg-app-surface-muted/20",
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left font-medium text-app-text"
                      aria-expanded={isOpen}
                      onClick={() => toggleItem(index)}
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-app-muted transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-app-border/60 px-4 pb-4 pt-3">
                        {item.body?.trim() ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-muted">
                            {item.body}
                          </p>
                        ) : (
                          <p className="text-sm italic text-app-muted/80">{labels.emptyBody}</p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
