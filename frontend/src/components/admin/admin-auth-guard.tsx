"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, setContext, user, navigation } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) {
        router.replace("/login?redirect=/admin");
        return;
      }

      const hasCachedContext = Boolean(user && navigation.length > 0);
      if (hasCachedContext) {
        setReady(true);
      }

      try {
        const { data } = await apiClient.getAdminContext(token);
        setContext(data);
        setReady(true);
      } catch {
        useAuthStore.getState().logout();
        router.replace("/login?redirect=/admin");
      }
    }

    load();
  }, [token, router, setContext, user, navigation.length]);

  if (!ready || !user) {
    return <PageLoading label="Loading admin panel..." fullScreen />;
  }

  return <>{children}</>;
}
