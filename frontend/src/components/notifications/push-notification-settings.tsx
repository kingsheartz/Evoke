"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import {
  getPushPermission,
  getStoredPushToken,
  requestPushToken,
  unregisterPushToken,
} from "@/lib/firebase-messaging";
import { useAuthStore } from "@/stores/app";
import { apiClient, ApiError } from "@/lib/api";

export function PushNotificationSettings() {
  const token = useAuthStore((state) => state.token);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getPushPermission());
    setEnabled(Boolean(getStoredPushToken()));
  }, []);

  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-app-muted">
        Push notifications are not configured for this environment.
      </p>
    );
  }

  if (permission === "unsupported") {
    return (
      <p className="text-sm text-app-muted">
        Your browser does not support web push notifications.
      </p>
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
      setMessage(fcmToken ? "Push notifications enabled for this browser." : "Permission was not granted.");
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
      setMessage("Push notifications disabled for this browser.");
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
          {permission === "denied" ? (
            <p className="text-sm text-amber-400/90">
              Notifications are blocked in your browser. Enable them in site settings, then try again.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!enabled ? (
          <Button type="button" onClick={handleEnable} disabled={busy || permission === "denied"}>
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
