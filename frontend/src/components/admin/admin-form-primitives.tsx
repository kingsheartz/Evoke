import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminBackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm text-app-muted transition-colors hover:text-accent-soft",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function FormError({ message, className }: { message?: string | null; className?: string }) {
  if (!message) return null;
  return <p className={cn("text-xs text-status-error", className)}>{message}</p>;
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-status-success">{message}</p>;
}
