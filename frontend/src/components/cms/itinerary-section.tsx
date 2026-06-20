"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import type { ItineraryContent } from "@/lib/cms-sections";
import { cn } from "@/lib/utils";

function SectionShell({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-3xl px-4 sm:px-6">{children}</section>;
}

export function ItinerarySection({ content }: { content: ItineraryContent }) {
  const items = (content.items ?? []).filter((item) => item.title?.trim());
  const hasCost = Boolean(content.cost_body?.trim());
  const [tab, setTab] = useState<"itinerary" | "cost">("itinerary");
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({ 0: true });

  if (items.length === 0 && !hasCost) return null;

  const toggleDay = (index: number) => {
    setOpenDays((prev) => ({
      ...prev,
      [index]: !(prev[index] ?? false),
    }));
  };

  return (
    <SectionShell>
      {(content.heading?.trim() || hasCost) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-app-border">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setTab("itinerary")}
              className={cn(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                tab === "itinerary"
                  ? "border-accent text-app-text"
                  : "border-transparent text-app-muted hover:text-app-text",
              )}
            >
              {content.heading?.trim() || "Itinerary"}
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
                {content.cost_heading?.trim() || "Cost"}
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "cost" && hasCost ? (
        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-app-muted">
          {content.cost_body}
        </div>
      ) : (
        <div className="relative">
          <div className="mb-3 flex justify-end gap-2">
            <button
              type="button"
              className="text-xs font-medium text-app-muted transition-colors hover:text-accent-soft"
              onClick={() =>
                setOpenDays(Object.fromEntries(items.map((_, index) => [index, true])))
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
              onClick={() => setOpenDays({})}
            >
              Collapse all
            </button>
          </div>

          <div
            className="pointer-events-none absolute bottom-4 left-4.5 top-4 w-px -translate-x-1/2 border-l border-dashed border-app-border/90"
            aria-hidden
          />

          <ol className="space-y-2">
            {items.map((item, index) => {
              const isStart = item.milestone === "start" || (item.milestone !== "end" && index === 0);
              const isEnd = item.milestone === "end" || (item.milestone !== "start" && index === items.length - 1);
              const isMilestone = isStart || isEnd;
              const isOpen = openDays[index] ?? false;

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
                      {isMilestone && <MapPin className="h-4 w-4" strokeWidth={2} />}
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
                      onClick={() => toggleDay(index)}
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
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-muted">{item.body}</p>
                        ) : (
                          <p className="text-sm italic text-app-muted/80">No details added for this day yet.</p>
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
    </SectionShell>
  );
}
