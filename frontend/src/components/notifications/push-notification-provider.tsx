"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthHydrated } from "@/hooks/use-auth-hydration";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import { subscribeForegroundMessages, syncPushTokenIfGranted } from "@/lib/firebase-messaging";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const hydrated = useAuthHydrated();
  const token = useAuthStore((state) => state.token);
  const { info } = useNotifications();

  useEffect(() => {
    if (!hydrated || !token || !isFirebaseConfigured()) {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        await syncPushTokenIfGranted(token);
        if (cancelled || !isAdminRoute) {
          return;
        }

        // Customer site: no in-app push toasts — OS notifications + account inbox only.
        unsubscribe = await subscribeForegroundMessages((title, body, data) => {
          if (data?.event === "test.push") {
            return;
          }

          info(body ? `${title}: ${body}` : title);
        });
      } catch {
        // Push is optional — ignore setup failures (unsupported browser, blocked permission, etc.)
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [hydrated, token, info, isAdminRoute]);

  return <>{children}</>;
}
