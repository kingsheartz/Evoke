import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";
export type ThemeAccent = "violet" | "blue" | "emerald" | "rose" | "amber";

interface ThemeState {
  mode: ThemeMode;
  accent: ThemeAccent;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
}

export const themeOptions: { id: ThemeAccent; label: string; swatch: string }[] = [
  { id: "violet", label: "Violet", swatch: "#5d5dff" },
  { id: "blue", label: "Blue", swatch: "#3b82f6" },
  { id: "emerald", label: "Emerald", swatch: "#10b981" },
  { id: "rose", label: "Rose", swatch: "#f43f5e" },
  { id: "amber", label: "Amber", swatch: "#f59e0b" },
];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "dark",
      accent: "violet",
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
    }),
    { name: "evoke-theme" },
  ),
);

export function applyThemeToDocument(mode: ThemeMode, accent: ThemeAccent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.setAttribute("data-accent", accent);
}

export type ThemePreferences = {
  mode: ThemeMode;
  accent: ThemeAccent;
};

const VALID_MODES: ThemeMode[] = ["dark", "light"];
const VALID_ACCENTS: ThemeAccent[] = ["violet", "blue", "emerald", "rose", "amber"];

export function getThemePreferences(): ThemePreferences {
  const { mode, accent } = useThemeStore.getState();
  return { mode, accent };
}

/** Visual preview only — does not write to the persisted theme store. */
export function previewThemeOnDocument(theme?: Partial<ThemePreferences> | null) {
  if (!theme) return;
  const current = getThemePreferences();
  const mode = theme.mode && VALID_MODES.includes(theme.mode) ? theme.mode : current.mode;
  const accent = theme.accent && VALID_ACCENTS.includes(theme.accent) ? theme.accent : current.accent;
  applyThemeToDocument(mode, accent);
}

export function applyThemePreferences(theme?: Partial<ThemePreferences> | null) {
  if (!theme) return;
  const { setMode, setAccent } = useThemeStore.getState();
  if (theme.mode && VALID_MODES.includes(theme.mode)) setMode(theme.mode);
  if (theme.accent && VALID_ACCENTS.includes(theme.accent)) setAccent(theme.accent);
}
