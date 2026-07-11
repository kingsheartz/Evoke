"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export type AdminHotkeyKey =
  | "save"
  | "search"
  | "help"
  | "hotkeys"
  | "new"
  | "close"
  | "sidebar";

export type AdminHotkeys = Record<AdminHotkeyKey, string>;

export type AdminPreferences = {
  notifications: {
    enabled: boolean;
    position: NotificationPosition;
    defaultDurationMs: number;
    showProgressBar: boolean;
    showCountdown: boolean;
  };
  hotkeys: AdminHotkeys;
  tour: {
    autoStart: boolean;
    completedAt: string | null;
  };
};

export const HOTKEY_CATALOG: {
  key: AdminHotkeyKey;
  label: string;
  description: string;
}[] = [
  { key: "save", label: "Save / submit", description: "Trigger the primary save action on the current page" },
  { key: "search", label: "Search", description: "Focus the page search or filter field" },
  { key: "new", label: "New item", description: "Open add/create actions when available" },
  { key: "sidebar", label: "Toggle sidebar", description: "Collapse or expand the navigation sidebar" },
  { key: "hotkeys", label: "Shortcuts helper", description: "Open the keyboard shortcuts reference panel" },
  { key: "help", label: "Intro tour", description: "Start the admin walkthrough tour" },
  { key: "close", label: "Close panel", description: "Close open detail panels, modals, or the shortcuts helper" },
];

export const DEFAULT_ADMIN_PREFERENCES: AdminPreferences = {
  notifications: {
    enabled: true,
    position: "top-center",
    defaultDurationMs: 5000,
    showProgressBar: true,
    showCountdown: false,
  },
  hotkeys: {
    save: "mod+s",
    search: "mod+k",
    help: "shift+/",
    hotkeys: "mod+/",
    new: "mod+n",
    close: "escape",
    sidebar: "mod+b",
  },
  tour: {
    autoStart: false,
    completedAt: null,
  },
};

type AdminPreferencesState = AdminPreferences & {
  hydrated: boolean;
  preview: {
    notifications: AdminPreferences["notifications"] | null;
    hotkeys: AdminHotkeys | null;
  };
  setPreferences: (prefs: Partial<AdminPreferences>) => void;
  setNotifications: (patch: Partial<AdminPreferences["notifications"]>) => void;
  setHotkey: (key: AdminHotkeyKey, combo: string) => void;
  setTour: (patch: Partial<AdminPreferences["tour"]>) => void;
  resetTour: () => void;
  markTourComplete: () => void;
  setPreferencesPreview: (preview: {
    notifications?: AdminPreferences["notifications"];
    hotkeys?: AdminHotkeys;
  } | null) => void;
  clearPreferencesPreview: () => void;
  mergeFromServer: (server: {
    notifications?: Partial<AdminPreferences["notifications"]> & { position?: string };
    hotkeys?: Partial<AdminHotkeys>;
    tour?: Partial<AdminPreferences["tour"]>;
  }) => void;
};

export function selectEffectiveNotifications(state: AdminPreferencesState) {
  return state.preview.notifications ?? state.notifications;
}

export function selectEffectiveHotkeys(state: AdminPreferencesState) {
  return state.preview.hotkeys ?? state.hotkeys;
}

export const useAdminPreferencesStore = create<AdminPreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_ADMIN_PREFERENCES,
      hydrated: false,
      preview: { notifications: null, hotkeys: null },
      setPreferences: (prefs) => set((s) => ({ ...s, ...prefs })),
      setNotifications: (patch) =>
        set((s) => ({ notifications: { ...s.notifications, ...patch } })),
      setHotkey: (key, combo) =>
        set((s) => ({ hotkeys: { ...s.hotkeys, [key]: combo } })),
      setTour: (patch) => set((s) => ({ tour: { ...s.tour, ...patch } })),
      resetTour: () => set((s) => ({ tour: { ...s.tour, completedAt: null } })),
      markTourComplete: () =>
        set((s) => ({ tour: { ...s.tour, completedAt: new Date().toISOString() } })),
      setPreferencesPreview: (preview) =>
        set({
          preview: preview
            ? {
                notifications: preview.notifications ?? null,
                hotkeys: preview.hotkeys ?? null,
              }
            : { notifications: null, hotkeys: null },
        }),
      clearPreferencesPreview: () =>
        set({ preview: { notifications: null, hotkeys: null } }),
      mergeFromServer: (server) =>
        set((s) => {
          const n = server.notifications ?? {};
          const validPositions: NotificationPosition[] = [
            "top-right", "top-left", "bottom-right", "bottom-left", "top-center", "bottom-center",
          ];
          const position =
            n.position && validPositions.includes(n.position as NotificationPosition)
              ? (n.position as NotificationPosition)
              : s.notifications.position;
          return {
            notifications: { ...s.notifications, ...n, position },
            hotkeys: { ...DEFAULT_ADMIN_PREFERENCES.hotkeys, ...s.hotkeys, ...(server.hotkeys ?? {}) },
            tour: { ...s.tour, ...(server.tour ?? {}) },
          };
        }),
    }),
    {
      name: "evoke-admin-preferences",
      partialize: (s) => ({
        notifications: s.notifications,
        hotkeys: s.hotkeys,
        tour: s.tour,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hotkeys = { ...DEFAULT_ADMIN_PREFERENCES.hotkeys, ...state.hotkeys };
          state.hydrated = true;
        }
      },
    },
  ),
);

export function formatHotkeyCombo(combo: string): string {
  if (combo === "escape") return "Esc";
  return combo
    .split("+")
    .map((part) => {
      if (part === "mod") return typeof navigator !== "undefined" && /Mac/i.test(navigator.platform) ? "⌘" : "Ctrl";
      if (part === "shift") return "Shift";
      if (part === "alt") return "Alt";
      if (part === " ") return "Space";
      return part.length === 1 ? part.toUpperCase() : part;
    })
    .join(" + ");
}

export function eventMatchesHotkey(event: KeyboardEvent, combo: string): boolean {
  if (combo === "escape") return event.key === "Escape";

  const parts = combo.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const needsMod = parts.includes("mod");
  const needsShift = parts.includes("shift");
  const needsAlt = parts.includes("alt");
  const mod = event.metaKey || event.ctrlKey;

  if (needsMod !== mod) return false;
  if (needsShift !== event.shiftKey) return false;
  if (needsAlt !== event.altKey) return false;

  const eventKey = event.key.toLowerCase();
  if (key === "/") return eventKey === "/";
  if (key.length === 1) return eventKey === key;
  return eventKey === key;
}

export function captureHotkeyFromEvent(event: KeyboardEvent): string | null {
  if (event.key === "Escape") return "escape";
  if (["Control", "Meta", "Shift", "Alt"].includes(event.key)) return null;

  const parts: string[] = [];
  if (event.metaKey || event.ctrlKey) parts.push("mod");
  if (event.shiftKey) parts.push("shift");
  if (event.altKey) parts.push("alt");

  let key = event.key.toLowerCase();
  if (key === " ") key = "space";
  parts.push(key);

  return parts.join("+");
}
