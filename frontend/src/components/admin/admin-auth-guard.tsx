"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

  useLayoutEffect(() => {
    if (!hydrated || !token) return;
    const cached = useAuthStore.getState();
    if (cached.user && cached.navigation.length > 0) {
      setReady(true);
    }
  }, [hydrated, token]);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace("/login?redirect=/admin");
      return;
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
        const cached = useAuthStore.getState();
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
    const label = !hydrated || token ? "Loading admin panel..." : "Redirecting to sign in...";
    // Full viewport — avoids the right-pane-only loader looking "stuck" on sign-out.
    return <PageLoading label={label} layout="viewport" />;
  }

  return <>{children}</>;
}
