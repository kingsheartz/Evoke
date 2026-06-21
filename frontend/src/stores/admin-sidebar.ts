import { create } from "zustand";
import { persist } from "zustand/middleware";

const MIN_WIDTH = 220;
const MAX_WIDTH = 320;
const DEFAULT_WIDTH = 256;
const COLLAPSED_WIDTH = 72;

interface AdminSidebarState {
  collapsed: boolean;
  width: number;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setWidth: (width: number) => void;
  getSidebarWidth: () => number;
}

function clampWidth(width: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
}

/** @deprecated Only for debugging — do not use during render (SSR mismatch). */
export function readPersistedSidebarState(): { width: number; collapsed: boolean } {
  if (typeof window === "undefined") {
    return { width: DEFAULT_WIDTH, collapsed: false };
  }
  try {
    const raw = localStorage.getItem("evoke-admin-sidebar");
    if (!raw) return { width: DEFAULT_WIDTH, collapsed: false };
    const parsed = JSON.parse(raw) as { state?: { collapsed?: boolean; width?: number } };
    const collapsed = Boolean(parsed.state?.collapsed);
    const width = collapsed ? COLLAPSED_WIDTH : clampWidth(parsed.state?.width ?? DEFAULT_WIDTH);
    return { width, collapsed };
  } catch {
    return { width: DEFAULT_WIDTH, collapsed: false };
  }
}

export function syncAdminSidebarWidthVar(width: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--admin-sidebar-width", `${width}px`);
}

export const useAdminSidebarStore = create<AdminSidebarState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      width: DEFAULT_WIDTH,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setWidth: (width) => set({ width: clampWidth(width) }),
      getSidebarWidth: () => (get().collapsed ? COLLAPSED_WIDTH : get().width),
    }),
    { name: "evoke-admin-sidebar" },
  ),
);

export { COLLAPSED_WIDTH, DEFAULT_WIDTH, MIN_WIDTH, MAX_WIDTH };
