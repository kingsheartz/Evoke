import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/skeleton";

export function DataTable({
  children,
  className,
  inset,
}: {
  children: ReactNode;
  className?: string;
  inset?: boolean;
}) {
  return (
    <div
      data-inset={inset ? "true" : undefined}
      className={cn(
        "table-wrap",
        inset
          ? "rounded-none border-0 border-t border-app-border bg-transparent"
          : "rounded-xl border border-app-border bg-app-surface/40",
        className,
      )}
    >
      <table
        className={cn(
          "data-table w-full text-left text-sm",
          inset && "table-inset",
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function TableEmpty({
  message,
  action,
  inset,
}: {
  message: string;
  action?: ReactNode;
  inset?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", inset && "px-6")}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 ring-1 ring-accent/30">
        <svg className="h-6 w-6 text-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sm text-app-text">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TableLoading({ cols = 4, rows = 5, inset }: { cols?: number; rows?: number; inset?: boolean }) {
  return (
    <div className={cn(inset ? "px-6 py-4" : "p-6")}>
      <TableSkeleton rows={rows} cols={cols} />
    </div>
  );
}
