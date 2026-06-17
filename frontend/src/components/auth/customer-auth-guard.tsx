"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export function CustomerAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, setAuth } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) {
        router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (user) {
        setReady(true);
        return;
      }

      try {
        const { data } = await apiClient.me(token);
        setAuth(data, token);
        setReady(true);
      } catch {
        useAuthStore.getState().logout();
        router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      }
    }

    load();
  }, [token, user, router, pathname, setAuth]);

  if (!ready || !user) {
    return <PageLoading label="Loading your account..." />;
  }

  return <>{children}</>;
}
