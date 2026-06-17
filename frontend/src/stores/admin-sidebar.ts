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
