import * as React from "react";
import { cn } from "@/lib/utils";
import { formatStatus, type StatusVariant } from "@/lib/status-labels";

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  error: "bg-red-500/15 text-red-300 ring-red-500/30",
  info: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  neutral: "bg-app-surface-muted text-app-muted ring-app-border",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string | boolean | null | undefined;
  className?: string;
}) {
  const { label, variant } = formatStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
