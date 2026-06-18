"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;
  const onChange = (next: string) => {
    setInternal(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={cn("space-y-5", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/** Pill tab buttons — sits above content with gap from TabsPanel */
export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div role="tablist" className={cn("flex flex-wrap gap-2", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");

  const active = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.onChange(value)}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-accent/15 text-accent-soft ring-1 ring-accent/40"
          : "bg-app-surface-muted/50 text-app-muted ring-1 ring-app-border/60 hover:bg-app-surface-muted hover:text-app-text",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Content card — separate from pill tabs with visual gap (via Tabs space-y-5) */
export function TabsPanel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-app-border bg-app-surface/80 glass-card ring-1 ring-app-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");
  if (ctx.value !== value) return null;

  return (
    <div role="tabpanel" className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}
