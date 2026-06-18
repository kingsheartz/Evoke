"use client";

import { Moon, Sun } from "lucide-react";
import { themeOptions, useThemeStore, type ThemeAccent, type ThemeMode, type ThemePreferences } from "@/stores/theme";
import { cn } from "@/lib/utils";

export function ThemeSettings({
  className,
  value,
  onChange,
}: {
  className?: string;
  value?: ThemePreferences;
  onChange?: (theme: ThemePreferences) => void;
}) {
  const storeMode = useThemeStore((s) => s.mode);
  const storeAccent = useThemeStore((s) => s.accent);
  const mode = value?.mode ?? storeMode;
  const accent = value?.accent ?? storeAccent;

  const setMode = (nextMode: ThemeMode) => {
    if (onChange) onChange({ mode: nextMode, accent });
    else useThemeStore.getState().setMode(nextMode);
  };

  const setAccent = (nextAccent: ThemeAccent) => {
    if (onChange) onChange({ mode, accent: nextAccent });
    else useThemeStore.getState().setAccent(nextAccent);
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <p className="text-sm font-medium text-app-text">Appearance</p>
        <p className="mt-1 text-xs text-app-muted">Light or dark base, plus an accent color.</p>
        <div className="mt-3 inline-flex rounded-xl border border-app-border bg-app-surface-muted/50 p-1">
          {(["dark", "light"] as ThemeMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                mode === m
                  ? "bg-accent text-white shadow-sm"
                  : "text-app-muted hover:text-app-text",
              )}
            >
              {m === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {m === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-app-text">Accent color</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              title={option.label}
              onClick={() => setAccent(option.id as ThemeAccent)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-105",
                accent === option.id ? "border-app-text scale-105" : "border-transparent",
              )}
              style={{ backgroundColor: option.swatch }}
              aria-label={option.label}
              aria-pressed={accent === option.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
