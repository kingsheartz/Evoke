export type TextFontFamily = "inherit" | "display" | "sans" | "serif" | "mono";
export type TextFontSize =
  | "inherit"
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl";
export type TextFontWeight = "inherit" | "normal" | "medium" | "semibold" | "bold";
export type TextLetterSpacing = "inherit" | "normal" | "wide" | "wider" | "widest";
export type TextTransform = "inherit" | "none" | "uppercase" | "lowercase" | "capitalize";
export type TextAlign = "inherit" | "left" | "center" | "right";
export type TextColor = "inherit" | "default" | "muted" | "accent" | "accent-soft" | "white";

export interface TextFormat {
  fontFamily?: TextFontFamily;
  fontSize?: TextFontSize;
  fontWeight?: TextFontWeight;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: TextLetterSpacing;
  textTransform?: TextTransform;
  textAlign?: TextAlign;
  color?: TextColor;
}

export type TextFormatCapabilities = {
  fontFamily?: boolean;
  fontSize?: boolean;
  fontWeight?: boolean;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: boolean;
  textTransform?: boolean;
  textAlign?: boolean;
  color?: boolean;
};

export const TEXT_FORMAT_PRESETS: Record<string, TextFormatCapabilities> = {
  full: {
    fontFamily: true,
    fontSize: true,
    fontWeight: true,
    italic: true,
    underline: true,
    letterSpacing: true,
    textTransform: true,
    textAlign: true,
    color: true,
  },
  heading: {
    fontFamily: true,
    fontSize: true,
    fontWeight: true,
    italic: true,
    letterSpacing: true,
    textTransform: true,
    textAlign: true,
    color: true,
  },
  body: {
    fontFamily: true,
    fontSize: true,
    fontWeight: true,
    italic: true,
    underline: true,
    textAlign: true,
    color: true,
  },
  label: {
    fontSize: true,
    fontWeight: true,
    italic: true,
    textTransform: true,
    letterSpacing: true,
    color: true,
  },
  button: {
    fontSize: true,
    fontWeight: true,
    italic: true,
    textTransform: true,
    letterSpacing: true,
  },
  eyebrow: {
    fontSize: true,
    fontWeight: true,
    letterSpacing: true,
    textTransform: true,
    color: true,
  },
};

export const TEXT_FONT_FAMILY_OPTIONS: { value: TextFontFamily; label: string }[] = [
  { value: "inherit", label: "Default" },
  { value: "display", label: "Display (Jakarta)" },
  { value: "sans", label: "Sans (Geist)" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

export const TEXT_FONT_SIZE_OPTIONS: { value: TextFontSize; label: string }[] = [
  { value: "inherit", label: "Default" },
  { value: "xs", label: "Extra small" },
  { value: "sm", label: "Small" },
  { value: "base", label: "Base" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
  { value: "3xl", label: "3XL" },
  { value: "4xl", label: "4XL" },
  { value: "5xl", label: "5XL" },
  { value: "6xl", label: "6XL" },
  { value: "7xl", label: "7XL" },
];

export const TEXT_FONT_WEIGHT_OPTIONS: { value: TextFontWeight; label: string }[] = [
  { value: "inherit", label: "Default" },
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
];

export const TEXT_LETTER_SPACING_OPTIONS: { value: TextLetterSpacing; label: string }[] = [
  { value: "inherit", label: "Default" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "wider", label: "Wider" },
  { value: "widest", label: "Widest" },
];

export const TEXT_TRANSFORM_OPTIONS: { value: TextTransform; label: string }[] = [
  { value: "inherit", label: "Default" },
  { value: "none", label: "None" },
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "capitalize", label: "Capitalize" },
];

export const TEXT_ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
  { value: "inherit", label: "Default" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export const TEXT_COLOR_OPTIONS: { value: TextColor; label: string }[] = [
  { value: "inherit", label: "Default" },
  { value: "default", label: "Primary text" },
  { value: "muted", label: "Muted" },
  { value: "accent", label: "Accent" },
  { value: "accent-soft", label: "Accent soft" },
  { value: "white", label: "White" },
];

const FONT_FAMILY_CLASS: Record<TextFontFamily, string> = {
  inherit: "",
  display: "font-display",
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

const FONT_SIZE_CLASS: Record<TextFontSize, string> = {
  inherit: "",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
  "7xl": "text-7xl",
};

const FONT_WEIGHT_CLASS: Record<TextFontWeight, string> = {
  inherit: "",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const LETTER_SPACING_CLASS: Record<TextLetterSpacing, string> = {
  inherit: "",
  normal: "tracking-normal",
  wide: "tracking-wide",
  wider: "tracking-wider",
  widest: "tracking-widest",
};

const TEXT_TRANSFORM_CLASS: Record<TextTransform, string> = {
  inherit: "",
  none: "normal-case",
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
};

const TEXT_ALIGN_CLASS: Record<TextAlign, string> = {
  inherit: "",
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const TEXT_COLOR_CLASS: Record<TextColor, string> = {
  inherit: "",
  default: "text-app-text",
  muted: "text-app-muted",
  accent: "text-accent",
  "accent-soft": "text-accent-soft",
  white: "text-white",
};

export function hasTextFormat(format?: TextFormat | null): boolean {
  if (!format) return false;
  return Object.values(format).some((value) => value !== undefined && value !== false && value !== "inherit");
}

export function textFormatClassName(format?: TextFormat | null, baseClassName?: string): string {
  const parts = [baseClassName ?? ""];

  if (!format) return parts.filter(Boolean).join(" ");

  if (format.fontFamily && format.fontFamily !== "inherit") {
    parts.push(FONT_FAMILY_CLASS[format.fontFamily]);
  }
  if (format.fontSize && format.fontSize !== "inherit") {
    parts.push(FONT_SIZE_CLASS[format.fontSize]);
  }
  if (format.fontWeight && format.fontWeight !== "inherit") {
    parts.push(FONT_WEIGHT_CLASS[format.fontWeight]);
  }
  if (format.italic) parts.push("italic");
  if (format.underline) parts.push("underline");
  if (format.letterSpacing && format.letterSpacing !== "inherit") {
    parts.push(LETTER_SPACING_CLASS[format.letterSpacing]);
  }
  if (format.textTransform && format.textTransform !== "inherit") {
    parts.push(TEXT_TRANSFORM_CLASS[format.textTransform]);
  }
  if (format.textAlign && format.textAlign !== "inherit") {
    parts.push(TEXT_ALIGN_CLASS[format.textAlign]);
  }
  if (format.color && format.color !== "inherit") {
    parts.push(TEXT_COLOR_CLASS[format.color]);
  }

  return parts.filter(Boolean).join(" ");
}

export function patchTextFormat(format: TextFormat | undefined, patch: Partial<TextFormat>): TextFormat | undefined {
  const next = { ...format, ...patch };
  const cleaned = Object.fromEntries(
    Object.entries(next).filter(([, value]) => value !== undefined && value !== "inherit" && value !== false),
  ) as TextFormat;
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
