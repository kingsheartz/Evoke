"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, hasAdminAccess } from "@/lib/api";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

const links = [
  { href: "/academy", label: "Academy" },
  { href: "/shop", label: "Sports Shop" },
  { href: "/tours", label: "Tours & Travels" },
];

export function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, token, roles, permissions, logout } = useAuthStore();
  const isAdmin = hasAdminAccess(roles, permissions);
  const isLoggedIn = Boolean(user && token);

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
        className="h-10 w-10 p-0 text-white"
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
            "absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-app-border glass p-6 transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-app-text">Evoke</span>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-9 w-9 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-app-text transition-colors hover:bg-white/[0.06] hover:text-accent-soft"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 pt-6">
            {isLoggedIn ? (
              <>
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
