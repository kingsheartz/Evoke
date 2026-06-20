import type { LucideIcon } from "lucide-react";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Standard wrapper for action buttons inside data table rows. */
export function TableRowActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("table-actions", className)}>{children}</div>;
}

/** Icon + label action for table rows — ghost style avoids double borders in inset tables. */
export function TableActionButton({
  icon,
  children,
  className,
  ...props
}: React.ComponentProps<typeof ActionButton>) {
  return (
    <ActionButton variant="ghost" size="sm" icon={icon} className={cn("table-action-btn", className)} {...props}>
      {children}
    </ActionButton>
  );
}

/** Destructive row action — matches CMS delete pattern. */
export function TableDeleteButton({
  children = "Delete",
  className,
  ...props
}: ButtonProps & { icon?: LucideIcon }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("table-action-btn table-action-btn--delete", className)}
      {...props}
    >
      <Trash2 className="h-4 w-4 text-status-error" />
      {children}
    </Button>
  );
}

/** Plain table row button — ghost by default for inset table cells. */
export function TableRowButton({ className, variant = "ghost", size = "sm", ...props }: ButtonProps) {
  return <Button variant={variant} size={size} className={cn("table-action-btn", className)} {...props} />;
}
