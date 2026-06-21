"use client";

import { useState } from "react";
import { ChevronDown, Italic, Type, Underline } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  patchTextFormat,
  TEXT_ALIGN_OPTIONS,
  TEXT_COLOR_OPTIONS,
  TEXT_FONT_FAMILY_OPTIONS,
  TEXT_FONT_SIZE_OPTIONS,
  TEXT_FONT_WEIGHT_OPTIONS,
  TEXT_FORMAT_PRESETS,
  TEXT_LETTER_SPACING_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
  type TextFormat,
  type TextFormatCapabilities,
  textFormatClassName,
} from "@/lib/text-format";
import { cn } from "@/lib/utils";

function FormatToggle({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs transition-colors",
        active
          ? "border-accent bg-accent/15 text-accent-soft"
          : "border-app-border bg-app-surface-muted/40 text-app-muted hover:text-app-text",
      )}
    >
      {children}
    </button>
  );
}

function FormatSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-app-muted">{label}</Label>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function FormattedTextField({
  label,
  value,
  format,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  preset = "body",
  capabilities: capabilitiesOverride,
  className,
}: {
  label: string;
  value: string;
  format?: TextFormat;
  onChange: (text: string, format?: TextFormat) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  preset?: keyof typeof TEXT_FORMAT_PRESETS;
  capabilities?: TextFormatCapabilities;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const capabilities = capabilitiesOverride ?? TEXT_FORMAT_PRESETS[preset] ?? TEXT_FORMAT_PRESETS.body;

  const patch = (updates: Partial<TextFormat>) => {
    onChange(value, patchTextFormat(format, updates));
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1 text-xs text-app-muted transition-colors hover:text-app-text"
        >
          <Type className="h-3.5 w-3.5" />
          Format
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      <InputComponent
        value={value}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        onChange={(e) => onChange(e.target.value, format)}
        className={textFormatClassName(format, "transition-[font-size,color,font-weight] duration-200")}
      />

      {open ? (
        <div className="rounded-lg border border-app-border bg-app-surface-muted/25 p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.fontFamily ? (
              <FormatSelect
                label="Font family"
                value={format?.fontFamily ?? "inherit"}
                options={TEXT_FONT_FAMILY_OPTIONS}
                onChange={(next) => patch({ fontFamily: next as TextFormat["fontFamily"] })}
              />
            ) : null}
            {capabilities.fontSize ? (
              <FormatSelect
                label="Size"
                value={format?.fontSize ?? "inherit"}
                options={TEXT_FONT_SIZE_OPTIONS}
                onChange={(next) => patch({ fontSize: next as TextFormat["fontSize"] })}
              />
            ) : null}
            {capabilities.fontWeight ? (
              <FormatSelect
                label="Weight"
                value={format?.fontWeight ?? "inherit"}
                options={TEXT_FONT_WEIGHT_OPTIONS}
                onChange={(next) => patch({ fontWeight: next as TextFormat["fontWeight"] })}
              />
            ) : null}
            {capabilities.letterSpacing ? (
              <FormatSelect
                label="Letter spacing"
                value={format?.letterSpacing ?? "inherit"}
                options={TEXT_LETTER_SPACING_OPTIONS}
                onChange={(next) => patch({ letterSpacing: next as TextFormat["letterSpacing"] })}
              />
            ) : null}
            {capabilities.textTransform ? (
              <FormatSelect
                label="Transform"
                value={format?.textTransform ?? "inherit"}
                options={TEXT_TRANSFORM_OPTIONS}
                onChange={(next) => patch({ textTransform: next as TextFormat["textTransform"] })}
              />
            ) : null}
            {capabilities.textAlign ? (
              <FormatSelect
                label="Alignment"
                value={format?.textAlign ?? "inherit"}
                options={TEXT_ALIGN_OPTIONS}
                onChange={(next) => patch({ textAlign: next as TextFormat["textAlign"] })}
              />
            ) : null}
            {capabilities.color ? (
              <FormatSelect
                label="Color"
                value={format?.color ?? "inherit"}
                options={TEXT_COLOR_OPTIONS}
                onChange={(next) => patch({ color: next as TextFormat["color"] })}
              />
            ) : null}
          </div>

          {(capabilities.italic || capabilities.underline) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {capabilities.italic ? (
                <FormatToggle
                  title="Italic"
                  active={format?.italic}
                  onClick={() => patch({ italic: !format?.italic || undefined })}
                >
                  <Italic className="h-3.5 w-3.5" />
                </FormatToggle>
              ) : null}
              {capabilities.underline ? (
                <FormatToggle
                  title="Underline"
                  active={format?.underline}
                  onClick={() => patch({ underline: !format?.underline || undefined })}
                >
                  <Underline className="h-3.5 w-3.5" />
                </FormatToggle>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Shorthand for section editors: reads/writes `field` + `field_format` on content object. */
export function SectionFormattedField({
  label,
  field,
  content,
  onPatch,
  placeholder,
  multiline,
  rows,
  preset,
}: {
  label: string;
  field: string;
  content: Record<string, unknown>;
  onPatch: (updates: Record<string, unknown>) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  preset?: keyof typeof TEXT_FORMAT_PRESETS;
}) {
  const formatKey = `${field}_format`;

  return (
    <FormattedTextField
      label={label}
      value={String(content[field] ?? "")}
      format={content[formatKey] as TextFormat | undefined}
      placeholder={placeholder}
      multiline={multiline}
      rows={rows}
      preset={preset}
      onChange={(text, format) => onPatch({ [field]: text, [formatKey]: format })}
    />
  );
}
