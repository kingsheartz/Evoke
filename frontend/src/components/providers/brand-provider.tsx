"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api";
import { DEFAULT_BRAND, mergeBrand, type BrandConfig, type BrandOverride } from "@/lib/brand";

const BrandContext = createContext<BrandConfig>(DEFAULT_BRAND);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<BrandOverride | null>(null);

  useEffect(() => {
    const load = () => {
      apiClient
        .getBrand()
        .then((r) => setOverride(r.data ?? null))
        .catch(() => setOverride(null));
    };

    load();
    window.addEventListener("evoke-brand-updated", load);
    return () => window.removeEventListener("evoke-brand-updated", load);
  }, []);

  const brand = useMemo(() => mergeBrand(DEFAULT_BRAND, override), [override]);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandConfig {
  return useContext(BrandContext);
}
