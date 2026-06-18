"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, hasAdminAccess } from "@/lib/api";
import { useAuthHydrated } from "@/hooks/use-auth-hydration";
import { useAuthStore } from "@/stores/app";

const ghostAction =
  "site-header-action site-header-action-ghost hidden sm:inline-flex";
const outlineAction =
  "site-header-action site-header-action-outline hidden sm:inline-flex";

export function SiteAuthActions({ className }: { className?: string }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const { user, token, roles, permissions, logout } = useAuthStore();
  const isAdmin = hasAdminAccess(roles, permissions);

  const handleSignOut = async () => {
    if (token) {
      try {
        await apiClient.logout(token);
      } catch {
        // clear local session regardless
      }
    }
    logout();
    router.push("/");
  };

  if (!hydrated) {
    return <div className={className} aria-hidden="true" />;
  }

  if (!user || !token) {
    return (
      <div className={className}>
        <Button variant="ghost" size="sm" asChild className={ghostAction}>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button variant="outline" size="sm" asChild className={outlineAction}>
          <Link href="/register">Get started</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button variant="ghost" size="sm" asChild className={ghostAction}>
        <Link href="/account">
          <User className="h-4 w-4" />
          {user.name.split(" ")[0]}
        </Link>
      </Button>
      {isAdmin && (
        <Button variant="outline" size="sm" asChild className={outlineAction}>
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className={`${ghostAction} site-header-action-muted`}
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
