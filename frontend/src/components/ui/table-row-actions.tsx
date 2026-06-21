import type { LucideIcon } from "lucide-react";
import { Loader2, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import * as React from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const tableIconDeleteClassName =
  "text-status-error hover:bg-status-error/10 hover:text-status-error";

export const tableIconPrimaryClassName = "text-accent-soft hover:bg-accent/10 hover:text-accent";

/** Standard wrapper for action buttons inside data table rows. */
export function TableRowActions({
  children,
  className,
  variant = "toolbar",
}: {
  children: ReactNode;
  className?: string;
  /** Compact icon toolbar — single row, no label wrap. */
  variant?: "default" | "toolbar";
}) {
  return (
    <div
      className={cn(
        "table-actions",
        variant === "toolbar" && "table-actions--toolbar",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TableIconActionTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="table-action-tooltip-wrap">
      {children}
      <span className="table-action-tooltip" role="tooltip">
        {label}
      </span>
    </span>
  );
}

/** Icon-only row action with hover tooltip — use inside `TableRowActions variant="toolbar"`. */
export function TableIconAction({
  icon: Icon,
  label,
  loading,
  className,
  asChild,
  children,
  ...props
}: ButtonProps & {
  icon: LucideIcon;
  label: string;
  loading?: boolean;
  asChild?: boolean;
}) {
  const adornment = loading ? (
    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
  ) : (
    <Icon className="h-4 w-4 shrink-0" />
  );

  const buttonClassName = cn("table-action-btn table-action-btn--icon h-8 w-8 rounded-lg", className);

  const button = asChild ? (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={buttonClassName}
      aria-label={label}
      disabled={loading || props.disabled}
      {...props}
    >
      {React.cloneElement(
        React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }>,
        undefined,
        adornment,
      )}
    </Button>
  ) : (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={buttonClassName}
      aria-label={label}
      disabled={loading || props.disabled}
      {...props}
    >
      {adornment}
    </Button>
  );

  return <TableIconActionTooltip label={label}>{button}</TableIconActionTooltip>;
}

/** Divider between primary and destructive toolbar actions. */
export function TableActionsDivider() {
  return <span className="table-actions-divider" aria-hidden />;
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
