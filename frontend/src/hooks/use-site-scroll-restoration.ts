"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getScrollStorageKey, scrollStorageKeyForPath } from "@/lib/scroll-jump";

/**
 * Remember and restore vertical scroll per URL (pathname + query) on the public site.
 */
export function useSiteScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollKey = getScrollStorageKey();
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const restore = () => {
      const raw = sessionStorage.getItem(scrollStorageKeyForPath(scrollKey));
      if (!raw) return;
      const y = Number(raw);
      if (!Number.isFinite(y) || y <= 0) return;
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
    };

    restore();
    const raf = requestAnimationFrame(restore);
    const timer = window.setTimeout(restore, 80);

    const save = () => {
      sessionStorage.setItem(scrollStorageKeyForPath(scrollKey), String(window.scrollY));
    };

    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", save);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", save);
      window.history.scrollRestoration = previous;
    };
  }, [pathname]);
}
