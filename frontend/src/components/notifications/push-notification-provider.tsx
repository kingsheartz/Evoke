"use client";

import { useEffect } from "react";
import { useAuthHydrated } from "@/hooks/use-auth-hydration";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import { subscribeForegroundMessages, syncPushTokenIfGranted } from "@/lib/firebase-messaging";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
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
        if (cancelled) {
          return;
        }

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
  }, [hydrated, token, info]);

  return <>{children}</>;
}
