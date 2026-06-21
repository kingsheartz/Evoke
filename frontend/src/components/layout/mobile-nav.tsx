"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import { EvokeLogo } from "@/components/brand/evoke-logo";
import { SiteHeaderExtras } from "@/components/brand/site-header-extras";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/components/providers/brand-provider";
import { apiClient, hasAdminAccess } from "@/lib/api";
import { useAuthHydrated } from "@/hooks/use-auth-hydration";
import { useAuthStore } from "@/stores/app";
import { useDivisionNav } from "@/hooks/use-division-nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { items: links } = useDivisionNav();
  const brand = useBrand();
  const hydrated = useAuthHydrated();
  const { user, token, roles, permissions, logout } = useAuthStore();
  const isAdmin = hasAdminAccess(roles, permissions);
  const isLoggedIn = hydrated && Boolean(user && token);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSignOut = async () => {
    if (token) {
      try {
        await apiClient.logout(token);
      } catch {
        // clear local session regardless
      }
    }
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        className="site-header-menu-btn h-10 w-10 p-0"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          className="absolute inset-0 bg-app-bg/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <nav
          className={cn(
            "absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-app-border bg-app-surface p-6 shadow-xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="mb-8 flex items-center justify-between gap-3">
            <EvokeLogo variant="icon" href="/" />
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-9 w-9 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              const href = link.public_path ?? `/${link.slug}`;
              return (
                <li key={link.slug}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-app-text transition-colors hover:bg-app-surface-muted hover:text-accent-soft"
                  >
                    {link.nav_label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <SiteHeaderExtras
            components={brand.header.components}
            preview="mobile"
            className="mt-6 flex-col items-stretch gap-2 border-t border-app-border pt-4"
          />
          <div className="mt-auto space-y-3 pt-6">
            {isLoggedIn ? (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/shop/cart" onClick={() => setOpen(false)}>
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/account" onClick={() => setOpen(false)}>
                    <User className="h-4 w-4" />
                    My account
                  </Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      Admin portal
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
