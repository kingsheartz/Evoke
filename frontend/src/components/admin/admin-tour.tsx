"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminPreferencesStore } from "@/stores/admin-preferences";

type TourStep = {
  target: string;
  title: string;
  body: string;
  preferRight?: boolean;
};

type Placement = "top" | "bottom" | "left" | "right" | "center";

const STEPS: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: "Navigation sidebar",
    body: "Use the sidebar to jump between Dashboard, CMS, business modules, and Settings. Collapse it for more workspace.",
    preferRight: true,
  },
  {
    target: '[data-tour="header"]',
    title: "Admin header",
    body: "Quick access to the public site. Start this tour anytime from the Tour button.",
  },
  {
    target: '[data-tour="settings-nav"]',
    title: "Settings hub",
    body: "Manage users, modules, notifications, hotkeys, and advertisements from dedicated settings pages.",
    preferRight: true,
  },
  {
    target: '[data-tour="main"]',
    title: "Workspace",
    body: "Each page shows contextual tools — filters, editors, and save actions. Use keyboard shortcuts from Preferences.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

type TooltipLayout = { top: number; left: number; placement: Placement };

const VIEWPORT_PAD = 16;
const GAP = 12;
const TOUR_Z = 2147483646;

function getTargetRect(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function computeTooltipPosition(
  target: Rect,
  tooltipW: number,
  tooltipH: number,
  preferRight: boolean,
): TooltipLayout {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isTallTarget = target.height > vh * 0.45;

  const fitsBelow = target.top + target.height + GAP + tooltipH <= vh - VIEWPORT_PAD;
  const fitsAbove = target.top - GAP - tooltipH >= VIEWPORT_PAD;
  const fitsRight = target.left + target.width + GAP + tooltipW <= vw - VIEWPORT_PAD;
  const fitsLeft = target.left - GAP - tooltipW >= VIEWPORT_PAD;

  let top: number;
  let left: number;
  let placement: Placement = "center";

  if (preferRight && isTallTarget && fitsRight) {
    left = target.left + target.width + GAP;
    top = (vh - tooltipH) / 2;
    placement = "left";
  } else if (preferRight && fitsRight) {
    left = target.left + target.width + GAP;
    top = target.top + target.height / 2 - tooltipH / 2;
    placement = "left";
  } else if (fitsBelow) {
    top = target.top + target.height + GAP;
    left = target.left + target.width / 2 - tooltipW / 2;
    placement = "top";
  } else if (fitsAbove) {
    top = target.top - GAP - tooltipH;
    left = target.left + target.width / 2 - tooltipW / 2;
    placement = "bottom";
  } else if (fitsRight) {
    left = target.left + target.width + GAP;
    top = target.top + target.height / 2 - tooltipH / 2;
    placement = "left";
  } else if (fitsLeft) {
    left = target.left - GAP - tooltipW;
    top = target.top + target.height / 2 - tooltipH / 2;
    placement = "right";
  } else {
    left = (vw - tooltipW) / 2;
    top = (vh - tooltipH) / 2;
    placement = "center";
  }

  top = Math.min(Math.max(VIEWPORT_PAD, top), vh - tooltipH - VIEWPORT_PAD);
  left = Math.min(Math.max(VIEWPORT_PAD, left), vw - tooltipW - VIEWPORT_PAD);

  return { top, left, placement };
}

function TourOverlay({ spotlight, onClose }: { spotlight: Rect | null; onClose: () => void }) {
  const maskId = useId().replace(/:/g, "");

  if (!spotlight) {
    return <div className="absolute inset-0 bg-black/75" onClick={onClose} aria-hidden />;
  }

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      aria-hidden
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect
            x={spotlight.left}
            y={spotlight.top}
            width={spotlight.width}
            height={spotlight.height}
            rx="12"
            fill="black"
          />
        </mask>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.78)" mask={`url(#${maskId})`} />
    </svg>
  );
}

function TourArrow({ placement }: { placement: Placement }) {
  if (placement === "center") return null;

  const arrowClass: Record<Exclude<Placement, "center">, string> = {
    left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-r-0 border-t-0",
    right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-l-0 border-b-0",
    top: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-0 border-l-0",
    bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-b-0 border-r-0",
  };

  return (
    <div
      className={cn(
        "absolute h-3 w-3 rotate-45 border border-app-border bg-app-surface",
        arrowClass[placement],
      )}
      aria-hidden
    />
  );
}

export function AdminIntroTour() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tooltipLayout, setTooltipLayout] = useState<TooltipLayout | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const markComplete = useAdminPreferencesStore((s) => s.markTourComplete);

  const current = STEPS[step];

  const updateGeometry = useCallback(() => {
    const targetRect = getTargetRect(current.target);
    setRect(targetRect);

    const el = tooltipRef.current;
    const tooltipW = el?.offsetWidth ?? 352;
    const tooltipH = el?.offsetHeight ?? 220;

    if (targetRect) {
      setTooltipLayout(computeTooltipPosition(targetRect, tooltipW, tooltipH, !!current.preferRight));
    } else {
      setTooltipLayout({
        top: Math.max(VIEWPORT_PAD, (window.innerHeight - tooltipH) / 2),
        left: Math.max(VIEWPORT_PAD, (window.innerWidth - tooltipW) / 2),
        placement: "center",
      });
    }
  }, [current]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onStart = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener("evoke-admin-tour-start", onStart);
    return () => window.removeEventListener("evoke-admin-tour-start", onStart);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("admin-tour-active");
      document.body.style.removeProperty("overflow");
      return;
    }
    document.body.classList.add("admin-tour-active");
    document.body.style.overflow = "hidden";

    const target = document.querySelector(current.target);
    target?.scrollIntoView({ block: "nearest", behavior: "smooth" });

    return () => {
      document.body.classList.remove("admin-tour-active");
      document.body.style.removeProperty("overflow");
    };
  }, [open, step, current.target]);

  useLayoutEffect(() => {
    if (!open) return;
    updateGeometry();
    const frame = requestAnimationFrame(updateGeometry);
    return () => cancelAnimationFrame(frame);
  }, [open, step, updateGeometry]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => updateGeometry();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, updateGeometry]);

  const close = () => {
    setOpen(false);
    markComplete();
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      close();
      return;
    }
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!mounted || !open) return null;

  const pad = 6;
  const spotlight = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  const tooltipStyle: React.CSSProperties = tooltipLayout
    ? { top: tooltipLayout.top, left: tooltipLayout.left }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  const badgeTop = spotlight ? Math.max(VIEWPORT_PAD, spotlight.top - 36) : 0;
  const badgeLeft = spotlight ? spotlight.left : 0;

  return createPortal(
    <div
      className="fixed inset-0"
      style={{ zIndex: TOUR_Z }}
      role="dialog"
      aria-modal="true"
      aria-label="Admin intro tour"
    >
      <TourOverlay spotlight={spotlight} onClose={close} />

      {spotlight && (
        <>
          <div
            className="pointer-events-none absolute rounded-xl border-2 border-accent shadow-[0_0_0_4px_rgba(93,93,255,0.35)]"
            style={spotlight}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute animate-pulse rounded-xl border-2 border-accent/60"
            style={spotlight}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute z-10 flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white shadow-lg shadow-accent/30"
            style={{ top: badgeTop, left: badgeLeft }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" aria-hidden />
            Look here — {current.title}
          </div>
        </>
      )}

      <div
        ref={tooltipRef}
        className="absolute w-[min(22rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-accent/40 bg-app-surface p-5 shadow-2xl shadow-black/50"
        style={tooltipStyle}
      >
        {tooltipLayout && <TourArrow placement={tooltipLayout.placement} />}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-accent-soft">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">Intro tour</span>
          </div>
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-md p-1 text-app-muted hover:text-app-text"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {spotlight && (
          <p className="mb-2 text-xs font-medium text-accent-soft">
            ↑ Highlighted on screen: {current.title}
          </p>
        )}
        <h3 className="text-base font-semibold text-app-text">{current.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-app-muted">{current.body}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-app-muted">
            Step {step + 1} of {STEPS.length}
          </span>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={prev} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" onClick={next}>
              {step >= STEPS.length - 1 ? "Finish" : "Next"}
              {step < STEPS.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-accent" : "bg-app-border")}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AdminTourTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-app-border bg-app-surface/80 px-3 py-1.5 text-xs text-app-muted transition-all hover:border-accent/30 hover:text-accent-soft"
      title="Start admin tour"
    >
      <Sparkles className="h-3 w-3" />
      Tour
    </button>
  );
}
