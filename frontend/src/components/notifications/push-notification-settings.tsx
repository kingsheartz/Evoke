"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import {
  getPushPermission,
  getStoredPushToken,
  requestPushToken,
  unregisterPushToken,
} from "@/lib/firebase-messaging";
import { detectPushCapability, type PushCapability } from "@/lib/push-capability";
import { useAuthStore } from "@/stores/app";
import { apiClient, ApiError } from "@/lib/api";

function IosInstallInstructions() {
  return (
    <div className="space-y-3 rounded-xl border border-app-border bg-app-surface-muted/40 p-4">
      <div className="flex items-start gap-3">
        <Smartphone className="mt-0.5 size-5 shrink-0 text-accent-soft" aria-hidden />
        <div className="space-y-2 text-sm text-app-muted">
          <p className="font-medium text-app-text">iPhone push needs the Evoke home-screen app</p>
          <p>
            Safari and Chrome on iPhone do not allow push from a normal browser tab. Install Evoke to
            your home screen, then enable notifications there.
          </p>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              Tap <span className="text-app-text">Share</span> in Safari (or the menu in Chrome)
            </li>
            <li>
              Choose <span className="text-app-text">Add to Home Screen</span>
            </li>
            <li>Open Evoke from the new icon on your home screen</li>
            <li>Return here and tap Enable notifications</li>
          </ol>
          <p>
            Until then, check{" "}
            <Link href="/account/notifications" className="font-medium text-accent-soft hover:text-accent">
              Account → Notifications
            </Link>{" "}
            for updates while signed in.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PushNotificationSettings() {
  const token = useAuthStore((state) => state.token);
  const [capability, setCapability] = useState<PushCapability>("checking");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const nextCapability = await detectPushCapability();
      if (cancelled) {
        return;
      }

      setCapability(nextCapability);
      setPermission(getPushPermission());
      setEnabled(Boolean(getStoredPushToken()));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-app-muted">
        Push notifications are not configured for this environment.
      </p>
    );
  }

  if (capability === "checking") {
    return <p className="text-sm text-app-muted">Checking notification support…</p>;
  }

  if (capability === "ios_install_required") {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="font-medium text-app-text">Browser push notifications</p>
          <p className="text-sm text-app-muted">
            Get order, enrollment, and booking updates when you are not on the site.
          </p>
        </div>
        <IosInstallInstructions />
      </div>
    );
  }

  if (capability === "unsupported") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-app-muted">
          This browser does not support web push notifications.
        </p>
        <p className="text-sm text-app-muted">
          You can still see updates in{" "}
          <Link href="/account/notifications" className="font-medium text-accent-soft hover:text-accent">
            Account → Notifications
          </Link>
          .
        </p>
      </div>
    );
  }

  const handleEnable = async () => {
    if (!token) {
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const fcmToken = await requestPushToken(token);
      setPermission(getPushPermission());
      setEnabled(Boolean(fcmToken));
      setMessage(
        fcmToken
          ? "Push notifications enabled for this device."
          : "Permission was not granted.",
      );
    } catch {
      setMessage("Could not enable push notifications. Try again or check browser settings.");
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!token) {
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await unregisterPushToken(token);
      setEnabled(false);
      setMessage("Push notifications disabled for this device.");
    } catch {
      setMessage("Could not disable push notifications.");
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    if (!token) {
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await apiClient.sendTestPushNotification(token);
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not send test notification.");
    } finally {
      setBusy(false);
    }
  };

  const blocked = capability === "denied" || permission === "denied";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        {enabled ? (
          <Bell className="mt-0.5 size-5 text-emerald-400" aria-hidden />
        ) : (
          <BellOff className="mt-0.5 size-5 text-app-muted" aria-hidden />
        )}
        <div className="space-y-1">
          <p className="font-medium text-app-text">Browser push notifications</p>
          <p className="text-sm text-app-muted">
            Get order, enrollment, and booking updates when you are not on the site.
          </p>
          {blocked ? (
            <p className="text-sm text-amber-400/90">
              Notifications are blocked on this device. Allow them in browser or iOS Settings, then
              try again.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!enabled ? (
          <Button type="button" onClick={handleEnable} disabled={busy || blocked}>
            Enable notifications
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={handleDisable} disabled={busy}>
              Disable on this device
            </Button>
            <Button type="button" variant="ghost" onClick={handleTest} disabled={busy}>
              Send test notification
            </Button>
          </>
        )}
      </div>

      {message ? <p className="text-sm text-app-muted">{message}</p> : null}
    </div>
  );
}
