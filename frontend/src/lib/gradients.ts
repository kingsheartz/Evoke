export type GradientPreset = {
  id: string;
  label: string;
  from: string;
  to: string;
  tailwind: string;
};

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: "blue-indigo", label: "Blue → Indigo", from: "#2563eb", to: "#4338ca", tailwind: "from-blue-600 to-indigo-700" },
  { id: "violet-indigo", label: "Violet → Indigo", from: "#7c3aed", to: "#4338ca", tailwind: "from-violet-600 to-indigo-700" },
  { id: "emerald-teal", label: "Emerald → Teal", from: "#059669", to: "#0f766e", tailwind: "from-emerald-600 to-teal-700" },
  { id: "cyan-blue", label: "Cyan → Blue", from: "#0891b2", to: "#1d4ed8", tailwind: "from-cyan-600 to-blue-700" },
  { id: "orange-rose", label: "Orange → Rose", from: "#ea580c", to: "#be123c", tailwind: "from-orange-600 to-rose-700" },
  { id: "amber-orange", label: "Amber → Orange", from: "#d97706", to: "#ea580c", tailwind: "from-amber-600 to-orange-700" },
  { id: "purple-pink", label: "Purple → Pink", from: "#9333ea", to: "#db2777", tailwind: "from-purple-600 to-pink-700" },
  { id: "rose-red", label: "Rose → Red", from: "#e11d48", to: "#dc2626", tailwind: "from-rose-600 to-red-700" },
];

const CUSTOM_GRADIENT_RE = /from-\[(#[0-9a-fA-F]{3,8})\]\s+to-\[(#[0-9a-fA-F]{3,8})\]/;

export function customGradientToTailwind(from: string, to: string): string {
  return `from-[${from}] to-[${to}]`;
}

export function parseGradientValue(value: string | null | undefined): {
  from: string;
  to: string;
  presetId: string | null;
  isCustom: boolean;
} {
  const normalized = (value ?? "").trim();
  const preset = GRADIENT_PRESETS.find((p) => p.tailwind === normalized);
  if (preset) {
    return { from: preset.from, to: preset.to, presetId: preset.id, isCustom: false };
  }

  const custom = normalized.match(CUSTOM_GRADIENT_RE);
  if (custom) {
    return { from: custom[1], to: custom[2], presetId: null, isCustom: true };
  }

  const fallback = GRADIENT_PRESETS[0];
  return { from: fallback.from, to: fallback.to, presetId: fallback.id, isCustom: false };
}

export function gradientPreviewStyle(from: string, to: string): { background: string } {
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
}
