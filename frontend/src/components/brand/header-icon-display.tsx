"use client";

import { getHeaderIcon } from "@/lib/header-icons";
import { cn } from "@/lib/utils";

export function HeaderIconDisplay({
  id,
  className,
  fallbackClassName,
}: {
  id?: string | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const icon = getHeaderIcon(id);
  if (!icon) {
    return <span className={cn("inline-block h-4 w-4 rounded bg-app-border/60", fallbackClassName, className)} />;
  }
  const Icon = icon.component;
  return <Icon className={cn("h-4 w-4 shrink-0", className)} aria-hidden />;
}
