import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminContext, NavItem, User } from "@/lib/api";
import { ALLOW_RUNTIME_BRAND_EDIT } from "@/lib/brand-defaults";
import { filterBrandNavigation } from "@/lib/brand";

interface AuthState {
  user: User | null;
  token: string | null;
  roles: string[];
  permissions: string[];
  navigation: NavItem[];
  setAuth: (user: User, token: string) => void;
  setContext: (context: AdminContext) => void;
  logout: () => void;
  hasPermission: (permission: string | string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      roles: [],
      permissions: [],
      navigation: [],
      setAuth: (user, token) =>
        set({
          user,
          token,
          roles: user.roles?.map((r) => r.name) ?? [],
          permissions: user.permissions?.map((p) => p.name) ?? [],
        }),
      setContext: (context) =>
        set({
          user: context.user,
          roles: context.roles,
          permissions: context.permissions,
          navigation: filterBrandNavigation(context.navigation, ALLOW_RUNTIME_BRAND_EDIT),
        }),
      logout: () =>
        set({ user: null, token: null, roles: [], permissions: [], navigation: [] }),
      hasPermission: (permission) => {
        const perms = get().permissions;
        const list = Array.isArray(permission) ? permission : [permission];
        return list.some((p) => perms.includes(p));
      },
    }),
    { name: "evoke-auth" },
  ),
);

interface ModuleState {
  modules: { slug: string; name: string; enabled: boolean }[];
  setModules: (modules: { slug: string; name: string; enabled: boolean }[]) => void;
  isEnabled: (slug: string) => boolean;
}

export const useModuleStore = create<ModuleState>((set, get) => ({
  modules: [],
  setModules: (modules) => set({ modules }),
  isEnabled: (slug) => get().modules.find((m) => m.slug === slug)?.enabled ?? false,
}));
