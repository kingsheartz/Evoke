import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("table-wrap", className)}>
      <table className="data-table text-left text-sm">{children}</table>
    </div>
  );
}

export function TableEmpty({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-app-muted">{message}</p>;
}

export function TableLoading({ message = "Loading..." }: { message?: string }) {
  return <p className="py-8 text-center text-sm text-app-muted">{message}</p>;
}
