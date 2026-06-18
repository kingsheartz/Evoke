"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageLoading } from "@/components/ui/page-loading";
import { apiClient, ApiError } from "@/lib/api";
import { useAuthHydrated } from "@/hooks/use-auth-hydration";
import { useAuthStore } from "@/stores/app";

export function CustomerAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [ready, setReady] = useState(false);
  const fetchedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const cachedUser = useAuthStore.getState().user;
    if (cachedUser) {
      setReady(true);
    }

    if (fetchedForToken.current === token) {
      return;
    }
    fetchedForToken.current = token;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await apiClient.me(token);
        if (cancelled) return;
        setAuth(data, token);
        setReady(true);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          useAuthStore.getState().logout();
          router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        if (cachedUser) {
          setReady(true);
          return;
        }
        useAuthStore.getState().logout();
        router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, router, pathname, setAuth]);

  if (!hydrated || !ready || !user) {
    return <PageLoading label="Loading your account..." />;
  }

  return <>{children}</>;
}
