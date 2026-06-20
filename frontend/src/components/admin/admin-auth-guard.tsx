"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient, ApiError } from "@/lib/api";
import { useAuthHydrated } from "@/hooks/use-auth-hydration";
import { useAuthStore } from "@/stores/app";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setContext = useAuthStore((s) => s.setContext);
  const [ready, setReady] = useState(false);
  const fetchedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace("/login?redirect=/admin");
      return;
    }

    const cached = useAuthStore.getState();
    if (cached.user && cached.navigation.length > 0) {
      setReady(true);
    }

    if (fetchedForToken.current === token) {
      return;
    }
    fetchedForToken.current = token;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await apiClient.getAdminContext(token);
        if (cancelled) return;
        setContext(data);
        setReady(true);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          useAuthStore.getState().logout();
          router.replace("/login?redirect=/admin");
          return;
        }
        if (cached.user && cached.navigation.length > 0) {
          setReady(true);
          return;
        }
        useAuthStore.getState().logout();
        router.replace("/login?redirect=/admin");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, router, setContext]);

  if (!hydrated || !token || !ready || !user) {
    return (
      <PageLoading
        label={token ? "Loading admin panel..." : "Signing out..."}
        layout="viewport"
      />
    );
  }

  return <>{children}</>;
}
