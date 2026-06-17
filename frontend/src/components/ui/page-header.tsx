import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
  badge,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  badge?: string;
}) {
  return (
    <div
      className={cn(
        "page-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="accent-rail-header min-w-0 py-0.5">
        {badge && (
          <span className="mb-2 inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent-soft ring-1 ring-accent/20">
            {badge}
          </span>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-app-text">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-app-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
