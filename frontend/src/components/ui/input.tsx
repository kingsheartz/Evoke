import * as React from "react";
import { controlledFieldValue } from "@/lib/controlled-field-value";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, ...props }, ref) => (
    <input
      type={type}
      suppressHydrationWarning
      className={cn(
        "flex h-11 w-full cursor-text rounded-xl border border-app-border bg-[var(--input-fill)] px-4 py-2 text-sm text-[var(--input-text)] outline-none transition-all duration-200 placeholder:text-app-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
      {...(value !== undefined ? { value: controlledFieldValue(value) } : {})}
    />
  ),
);
Input.displayName = "Input";

export { Input };
