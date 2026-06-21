import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AccountRecordCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-app-border bg-app-surface/80 p-4 ring-1 ring-app-border/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AccountRecordRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 text-sm", className)}>
      <span className="shrink-0 text-app-muted">{label}</span>
      <span className="min-w-0 text-right font-medium text-app-text">{value}</span>
    </div>
  );
}
