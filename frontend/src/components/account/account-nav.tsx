"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  GraduationCap,
  LayoutDashboard,
  Package,
  Palette,
  Plane,
  ShoppingBag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const accountNavItems = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/profile", label: "Profile & address", icon: User },
  { href: "/account/orders", label: "Shop orders", icon: Package },
  { href: "/shop/cart", label: "Cart", icon: ShoppingBag },
  { href: "/account/bookings", label: "Tour bookings", icon: Plane },
  { href: "/account/enrollments", label: "Enrollments", icon: GraduationCap },
  { href: "/account/certificates", label: "Certificates", icon: Award },
  { href: "/account/settings", label: "Theme & display", icon: Palette },
] as const;

export function AccountNav({
  className,
  onNavigate,
  variant = "sidebar",
}: {
  className?: string;
  onNavigate?: () => void;
  variant?: "sidebar" | "horizontal";
}) {
  const pathname = usePathname();

  if (variant === "horizontal") {
    return (
      <nav
        className={cn(
          "account-nav-horizontal flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
        aria-label="Account"
      >
        {accountNavItems.map((item) => {
          const active =
            item.href === "/shop/cart"
              ? pathname === "/shop/cart"
              : "exact" in item && item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
                active
                  ? "bg-accent/15 text-accent-soft ring-1 ring-accent/25"
                  : "bg-app-surface-muted/50 text-app-muted hover:bg-app-surface-muted hover:text-app-text",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Account">
      {accountNavItems.map((item) => {
        const active =
          item.href === "/shop/cart"
            ? pathname === "/shop/cart"
            : "exact" in item && item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent/15 text-accent-soft ring-1 ring-accent/25"
                : "text-app-muted hover:bg-app-surface-muted hover:text-app-text",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
