"use client";

import { AccountNav } from "@/components/account/account-nav";
import { useAuthStore } from "@/stores/app";

/** Compact account nav for phones/tablets — used above cart and account pages. */
export function AccountMobileHeader() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="mb-6 lg:hidden">
      <div className="mb-3 min-w-0">
        <p className="truncate text-sm font-medium text-app-text">{user.name}</p>
        <p className="truncate text-xs text-app-muted">{user.email}</p>
      </div>
      <AccountNav variant="horizontal" />
    </div>
  );
}
