"use client";

import { useEffect, useState } from "react";
import {
  GRADIENT_PRESETS,
  customGradientToTailwind,
  gradientPreviewStyle,
  parseGradientValue,
} from "@/lib/gradients";
import { cn } from "@/lib/utils";

interface GradientPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function GradientPicker({ value, onChange, className }: GradientPickerProps) {
  const parsed = parseGradientValue(value);
  const [fromColor, setFromColor] = useState(parsed.from);
  const [toColor, setToColor] = useState(parsed.to);
  const [customMode, setCustomMode] = useState(parsed.isCustom);

  useEffect(() => {
    const next = parseGradientValue(value);
    setFromColor(next.from);
    setToColor(next.to);
    setCustomMode(next.isCustom);
  }, [value]);

  const selectPreset = (tailwind: string, from: string, to: string) => {
    setCustomMode(false);
    setFromColor(from);
    setToColor(to);
    onChange(tailwind);
  };

  const updateCustom = (from: string, to: string) => {
    setCustomMode(true);
    setFromColor(from);
    setToColor(to);
    onChange(customGradientToTailwind(from, to));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {GRADIENT_PRESETS.map((preset) => {
          const selected = !customMode && parseGradientValue(value).presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.label}
              onClick={() => selectPreset(preset.tailwind, preset.from, preset.to)}
              className={cn(
                "h-10 w-10 rounded-xl border-2 transition-transform hover:scale-105",
                selected ? "border-app-text scale-105 ring-2 ring-accent/40" : "border-transparent",
              )}
              style={gradientPreviewStyle(preset.from, preset.to)}
              aria-label={preset.label}
              aria-pressed={selected}
            />
          );
        })}
      </div>

      <div className="rounded-xl border border-app-border bg-app-surface-muted/30 p-3">
        <p className="mb-2 text-xs font-medium text-app-muted">Custom colors</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-app-text">
            <span className="text-app-muted">From</span>
            <input
              type="color"
              value={fromColor}
              onChange={(e) => updateCustom(e.target.value, toColor)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-app-border bg-transparent p-0.5"
              aria-label="Gradient start color"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-app-text">
            <span className="text-app-muted">To</span>
            <input
              type="color"
              value={toColor}
              onChange={(e) => updateCustom(fromColor, e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-app-border bg-transparent p-0.5"
              aria-label="Gradient end color"
            />
          </label>
          <div
            className="h-9 min-w-24 flex-1 rounded-lg border border-app-border"
            style={gradientPreviewStyle(fromColor, toColor)}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
