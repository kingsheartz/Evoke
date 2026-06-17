import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("app-content mx-auto w-full max-w-7xl", className)}>
      {children}
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("page-container mx-auto w-full max-w-7xl", className)}>
      {children}
    </div>
  );
}
