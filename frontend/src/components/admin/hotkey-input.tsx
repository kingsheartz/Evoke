"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { captureHotkeyFromEvent, formatHotkeyCombo } from "@/stores/admin-preferences";

type HotkeyInputProps = {
  value: string;
  onChange: (combo: string) => void;
  disabled?: boolean;
  className?: string;
};

export function HotkeyInput({ value, onChange, disabled, className }: HotkeyInputProps) {
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!listening) return;

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const combo = captureHotkeyFromEvent(event);
      if (combo) {
        onChange(combo);
        setListening(false);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [listening, onChange]);

  return (
    <button
      ref={inputRef}
      type="button"
      disabled={disabled}
      onClick={() => setListening(true)}
      onBlur={() => setListening(false)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm transition-colors",
        listening && "border-accent/50 ring-2 ring-accent/20",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span className={cn("font-mono text-app-text", !value && "text-app-muted")}>
        {listening ? "Press keys…" : value ? formatHotkeyCombo(value) : "Click to record"}
      </span>
      <Keyboard className="h-4 w-4 shrink-0 text-app-muted" />
    </button>
  );
}
