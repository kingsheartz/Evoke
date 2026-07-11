import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Horizontal scroll container for wide tables, toolbars, and admin form rows. */
export function HorizontalScroll({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={cn("overflow-x-auto overscroll-x-contain", className)}>
      <div className={cn("w-max min-w-full", innerClassName)}>{children}</div>
    </div>
  );
}
