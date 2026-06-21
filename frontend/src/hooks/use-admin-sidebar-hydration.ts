"use client";

import { useEffect, useState } from "react";
import { useAdminSidebarStore } from "@/stores/admin-sidebar";

/** Wait for zustand persist before trusting collapsed/width from the store. */
export function useAdminSidebarHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAdminSidebarStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }

    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
