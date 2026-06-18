"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { FALLBACK_DIVISION_NAV, type DivisionNavItem } from "@/lib/division-page";

let cached: DivisionNavItem[] | null = null;

export function useDivisionNav() {
  const [items, setItems] = useState<DivisionNavItem[]>(cached ?? FALLBACK_DIVISION_NAV);
  const [loaded, setLoaded] = useState(Boolean(cached));

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getDivisionNav()
      .then((res) => {
        if (cancelled) return;
        const next = res.data?.length ? res.data : FALLBACK_DIVISION_NAV;
        cached = next;
        setItems(next);
      })
      .catch(() => {
        if (!cancelled) setItems(FALLBACK_DIVISION_NAV);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loaded };
}

export function invalidateDivisionNavCache() {
  cached = null;
}
