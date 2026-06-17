"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, setContext, user } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) {
        router.replace("/login?redirect=/admin");
        return;
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
  }, [token, router, setContext]);

  if (!ready || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading admin panel...</p>
      </div>
    );
  }

  return <>{children}</>;
}
