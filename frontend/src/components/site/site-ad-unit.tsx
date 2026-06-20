"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { dismissAd, readDismissedAdIds } from "@/lib/ad-placements";
import type { Advertisement } from "@/lib/api";
import { cn } from "@/lib/utils";

function subscribeDismissed(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("evoke-ad-dismissed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("evoke-ad-dismissed", handler);
  };
}

function useAdDismissed(id: string): [boolean, () => void] {
  const dismissed = useSyncExternalStore(
    subscribeDismissed,
    () => readDismissedAdIds().has(id),
    () => false,
  );

  const dismiss = useCallback(() => {
    dismissAd(id);
    window.dispatchEvent(new CustomEvent("evoke-ad-dismissed"));
  }, [id]);

  return [dismissed, dismiss];
}

interface SiteAdUnitProps {
  ad: Advertisement;
  variant: "floating" | "strip" | "inline";
  className?: string;
  onDismiss?: () => void;
}

export function SiteAdUnit({ ad, variant, className, onDismiss }: SiteAdUnitProps) {
  const [dismissed, dismiss] = useAdDismissed(ad.id);
  const dismissible = ad.dismissible ?? true;

  if (dismissed || !ad.image_url?.trim()) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismiss();
    onDismiss?.();
  };

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ad.image_url}
      alt={ad.title || "Promotion"}
      className={cn(
        variant === "strip"
          ? "h-9 w-auto max-w-full object-contain"
          : "h-full w-full object-cover",
      )}
    />
  );

  const linkedImage = ad.link_url ? (
    <Link href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
      {image}
    </Link>
  ) : (
    image
  );

  return (
    <div
      className={cn(
        "site-ad-unit relative",
        variant === "floating" && "overflow-hidden rounded-xl border border-app-border bg-app-surface/95 shadow-lg ring-1 ring-app-border/80 backdrop-blur-sm",
        variant === "inline" && "overflow-hidden rounded-2xl border border-app-border bg-app-surface/95 shadow-lg ring-1 ring-app-border/80 backdrop-blur-sm",
        variant === "strip" && "flex h-9 w-full items-center justify-center",
        className,
      )}
    >
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            "absolute z-10 flex items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75",
            variant === "strip" ? "right-0 top-1/2 h-6 w-6 -translate-y-1/2" : "right-1.5 top-1.5 h-7 w-7",
          )}
          aria-label="Dismiss advertisement"
        >
          <X className={variant === "strip" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>
      )}
      {variant === "strip" ? (
        <div className="flex w-full items-center justify-center px-8">{linkedImage}</div>
      ) : (
        <>
          <div className={variant === "floating" ? "aspect-[4/5]" : "aspect-[21/9]"}>{linkedImage}</div>
          {ad.title && (
            <p className="truncate px-3 py-2 text-xs font-medium text-app-text">{ad.title}</p>
          )}
        </>
      )}
    </div>
  );
}
