"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  getScrollContainer,
  readScrollMetrics,
  scrollToBottom,
  scrollToTop,
  type ScrollJumpVariant,
} from "@/lib/scroll-jump";
import { cn } from "@/lib/utils";

type JumpAction = "top" | "bottom";

const EDGE_THRESHOLD = 48;

export function ScrollJumpControls({ variant }: { variant: ScrollJumpVariant }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [action, setAction] = useState<JumpAction>("bottom");
  const [visible, setVisible] = useState(false);

  const refresh = useCallback(() => {
    const container = containerRef.current ?? getScrollContainer(variant);
    containerRef.current = container;
    const { scrollTop, scrollHeight, clientHeight } = readScrollMetrics(container);
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    const scrollable = maxScroll > 24;

    setCanScroll(scrollable);
    if (!scrollable) {
      setVisible(false);
      return;
    }

    const atTop = scrollTop < 80;
    const atBottom = scrollTop + clientHeight >= scrollHeight - EDGE_THRESHOLD;

    if (atTop) {
      setVisible(false);
      return;
    }

    if (atBottom) {
      setAction("top");
      setVisible(true);
      return;
    }

    const pastMidpoint = scrollTop > maxScroll * 0.45;
    setAction(pastMidpoint ? "top" : "bottom");
    setVisible(true);
  }, [variant]);

  useEffect(() => {
    containerRef.current = getScrollContainer(variant);
    const container = containerRef.current;
    const scrollTarget = container ?? window;

    refresh();

    const onScroll = () => refresh();
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => refresh()) : null;

    if (container && observer) {
      observer.observe(container);
      const content = container.firstElementChild;
      if (content instanceof HTMLElement) observer.observe(content);
    } else if (observer) {
      observer.observe(document.documentElement);
    }

    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      observer?.disconnect();
    };
  }, [refresh, variant]);

  const onClick = () => {
    if (action === "top") scrollToTop(containerRef.current);
    else scrollToBottom(containerRef.current);
  };

  if (!canScroll || !visible) return null;

  const goTop = action === "top";

  return (
    <div
      className={cn(
        "scroll-jump-controls pointer-events-none fixed z-[var(--z-scroll-jump)]",
        variant === "admin" ? "scroll-jump-controls--admin" : "scroll-jump-controls--site",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="scroll-jump-btn pointer-events-auto"
        aria-label={goTop ? "Scroll to top" : "Scroll to bottom"}
        title={goTop ? "Scroll to top" : "Scroll to bottom"}
      >
        {goTop ? <ArrowUp className="h-4 w-4" aria-hidden /> : <ArrowDown className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}
