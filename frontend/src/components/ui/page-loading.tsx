"use client";

import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PageLoadingLayout = "content" | "viewport" | "admin-panel" | "admin-main";

const OVERLAY_LAYOUTS: PageLoadingLayout[] = ["viewport", "admin-panel", "admin-main"];

export function PageLoading({
  label = "Loading...",
  layout = "content",
  /** @deprecated Use layout="viewport" */
  fullScreen = false,
  className,
}: {
  label?: string;
  layout?: PageLoadingLayout;
  fullScreen?: boolean;
  className?: string;
}) {
  const resolvedLayout = fullScreen ? "viewport" : layout;
  const isOverlay = OVERLAY_LAYOUTS.includes(resolvedLayout);

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        isOverlay
          ? "fixed inset-0 z-[2147483648] grid h-[100dvh] w-screen place-items-center bg-app-bg"
          : "page-loading page-loading--content",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-app-muted">{label}</p>
      </div>
    </div>
  );

  if (isOverlay && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
