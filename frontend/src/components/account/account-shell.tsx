"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { AccountNav } from "@/components/account/account-nav";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export function AccountShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();

  const handleSignOut = async () => {
    if (token) {
      try {
        await apiClient.logout(token);
      } catch {
        /* clear local session */
      }
    }
    logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <PageContainer className="py-8 md:py-12 lg:py-16">
      <AccountMobileHeader />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <aside className="hidden lg:block lg:w-56 lg:shrink-0">
          <div className="rounded-2xl border border-app-border bg-app-surface/60 p-4 lg:sticky lg:top-24">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent-soft">Account</p>
            <p className="mt-2 truncate px-3 text-sm font-medium text-app-text">{user.name}</p>
            <p className="truncate px-3 text-xs text-app-muted">{user.email}</p>
            <div className="mt-4 border-t border-app-border pt-4">
              <AccountNav />
            </div>
            <Button variant="ghost" size="sm" className="mt-4 w-full justify-start" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-6 md:mb-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl md:text-4xl">
              {title}
            </h1>
            {description && <p className="mt-2 text-app-muted">{description}</p>}
          </header>
          {children}
        </div>
      </div>
    </PageContainer>
  );
}
