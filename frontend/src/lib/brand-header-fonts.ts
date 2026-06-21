export type BrandHeaderFont = "jakarta" | "geist-sans" | "geist-mono";

export const BRAND_HEADER_FONTS: {
  id: BrandHeaderFont;
  label: string;
  className: string;
}[] = [
  { id: "jakarta", label: "Plus Jakarta Sans (Display)", className: "font-display" },
  { id: "geist-sans", label: "Geist Sans (Body)", className: "font-sans" },
  { id: "geist-mono", label: "Geist Mono", className: "font-mono" },
];

export const DEFAULT_BRAND_HEADER_FONT: BrandHeaderFont = "jakarta";

export function brandHeaderFontClass(font: BrandHeaderFont | undefined): string {
  return BRAND_HEADER_FONTS.find((f) => f.id === font)?.className ?? "font-display";
}
