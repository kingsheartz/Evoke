import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
  roles: { name: string }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
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
