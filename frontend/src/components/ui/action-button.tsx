import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionButton({
  icon: Icon,
  children,
  loading,
  className,
  asChild,
  ...props
}: ButtonProps & {
  icon?: LucideIcon;
  loading?: boolean;
}) {
  const adornment = loading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : Icon ? (
    <Icon className="h-4 w-4" />
  ) : null;

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{
      children?: React.ReactNode;
    }>;

    return (
      <Button
        className={cn(className)}
        asChild
        disabled={loading || props.disabled}
        {...props}
      >
        {React.cloneElement(
          child,
          undefined,
          <>
            {adornment}
            {child.props.children}
          </>,
        )}
      </Button>
    );
  }

  return (
    <Button className={cn(className)} disabled={loading || props.disabled} {...props}>
      {adornment}
      {children}
    </Button>
  );
}
