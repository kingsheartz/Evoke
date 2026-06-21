import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      suppressHydrationWarning
      className={cn(
        "form-select flex h-10 w-full rounded-lg border border-app-border bg-[var(--input-fill)] px-3.5 py-2 text-sm text-[var(--input-text)] outline-none transition-colors focus:border-accent-soft focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export { Select };
