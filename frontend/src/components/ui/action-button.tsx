import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionButton({
  icon: Icon,
  children,
  loading,
  className,
  ...props
}: ButtonProps & {
  icon?: LucideIcon;
  loading?: boolean;
}) {
  return (
    <Button className={cn(className)} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </Button>
  );
}
