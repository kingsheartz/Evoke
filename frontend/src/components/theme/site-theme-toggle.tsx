"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { cn } from "@/lib/utils";

export function SiteThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useThemeStore();

  const toggle = () => setMode(mode === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-app-border bg-app-surface px-3 py-1.5 text-xs font-medium text-app-muted transition-colors hover:border-accent/30 hover:text-app-text",
        className,
      )}
      aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {mode === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {mode === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
