"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { HeaderIconDisplay } from "@/components/brand/header-icon-display";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HEADER_ICON_CATEGORIES,
  getHeaderIcon,
  searchHeaderIcons,
  type HeaderIconCategory,
} from "@/lib/header-icons";
import { cn } from "@/lib/utils";

export function IconPicker({
  value,
  onChange,
  label = "Icon",
  allowClear = false,
  className,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
  label?: string;
  allowClear?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HeaderIconCategory | "all">("all");

  const selected = getHeaderIcon(value);
  const icons = useMemo(() => searchHeaderIcons(query, category), [query, category]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-app-border bg-[var(--input-fill)] px-3 py-2 text-left text-sm transition-colors hover:border-accent/40"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected ? (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-app-border bg-app-surface-muted/50">
                <HeaderIconDisplay id={selected.id} className="h-5 w-5" />
              </span>
              <span className="truncate font-medium text-app-text">{selected.label}</span>
            </>
          ) : (
            <span className="text-app-muted">Choose an icon…</span>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-app-muted transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="rounded-xl border border-app-border bg-app-surface p-3 shadow-lg">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search icons…"
              className="pl-9"
            />
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {HEADER_ICON_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  category === item.id
                    ? "bg-accent text-white"
                    : "bg-app-surface-muted/60 text-app-muted hover:text-app-text",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {allowClear && value ? (
            <button
              type="button"
              className="mb-3 text-xs text-app-muted underline-offset-2 hover:text-app-text hover:underline"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Clear icon (use default)
            </button>
          ) : null}

          <div className="max-h-72 overflow-y-auto rounded-lg border border-app-border/60 bg-app-surface-muted/20 p-2">
            {icons.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-app-muted">No icons match your search.</p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
                {icons.map((icon) => {
                  const active = icon.id === value;
                  return (
                    <button
                      key={icon.id}
                      type="button"
                      title={icon.label}
                      onClick={() => {
                        onChange(icon.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border border-transparent p-2 transition-colors hover:border-accent/30 hover:bg-accent/10",
                        active && "border-accent bg-accent/15 ring-1 ring-accent/40",
                      )}
                    >
                      <HeaderIconDisplay id={icon.id} className="h-5 w-5 shrink-0" />
                      <span className="w-full truncate text-center text-[10px] leading-tight text-app-muted">
                        {icon.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-app-muted">{icons.length} icons shown</p>
        </div>
      ) : null}
    </div>
  );
}
