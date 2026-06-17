"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, hasAdminAccess } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export function SiteAuthActions({ className }: { className?: string }) {
  const router = useRouter();
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

  if (!user || !token) {
    return (
      <div className={className}>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hidden text-white/90 hover:bg-white/10 hover:text-white sm:inline-flex"
        >
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/10"
        >
          <Link href="/register">Get started</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="hidden text-white/90 hover:bg-white/10 hover:text-white sm:inline-flex"
      >
        <Link href="/account">
          <User className="h-4 w-4" />
          {user.name.split(" ")[0]}
        </Link>
      </Button>
      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="hidden border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/10 sm:inline-flex"
        >
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="hidden text-white/70 hover:bg-white/10 hover:text-white sm:inline-flex"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
