"use client";

import { useEffect, type RefObject } from "react";

/** Smooth scroll progress 0–1 through a tall section (rAF + lerp). */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  enabled = true,
  lerp = 0.18,
) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let target = 0;
    let current = 0;
    let running = false;

    const read = () => {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const scrollable = el.offsetHeight - viewport;
      if (scrollable <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / scrollable));
    };

    const tick = () => {
      current += (target - current) * lerp;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
        onProgress(current);
        raf = 0;
        return;
      }
      onProgress(current);
      raf = window.requestAnimationFrame(tick);
    };

    const start = () => {
      target = read();
      if (!running) {
        running = true;
        raf = window.requestAnimationFrame(tick);
      }
    };

    start();
    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", start);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(start) : null;
    resizeObserver?.observe(el);

    return () => {
      window.removeEventListener("scroll", start);
      window.removeEventListener("resize", start);
      resizeObserver?.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [ref, onProgress, enabled, lerp]);
}

export function chapterProgress(global: number, index: number, count = 3): number {
  const size = 1 / count;
  const start = index * size;
  return Math.min(1, Math.max(0, (global - start) / size));
}

/** Fade panels in/out with overlap so chapter transitions feel continuous. */
export function chapterOpacity(global: number, index: number, count = 3, overlap = 0.14): number {
  const size = 1 / count;
  const start = index * size;
  const end = start + size;
  const fade = size * overlap;

  if (global <= start - fade) return 0;
  if (global < start + fade) return smoothstep(global, start - fade, start + fade);
  if (global <= end - fade) return 1;
  if (global < end + fade) return 1 - smoothstep(global, end - fade, end + fade);
  return 0;
}

export function smoothstep(value: number, edge0: number, edge1: number): number {
  if (edge0 === edge1) return value >= edge1 ? 1 : 0;
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}
