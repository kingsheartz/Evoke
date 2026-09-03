"use client";

import { AccountShell } from "@/components/account/account-shell";
import { PushNotificationSettings } from "@/components/notifications/push-notification-settings";
import { ThemeSettings } from "@/components/theme/theme-settings";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/app";

export default function AccountSettingsPage() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <AccountShell
      title="Settings"
      description="Notifications, theme, and how Evoke looks on your device."
    >
      <Card variant="glass">
        <CardContent className="space-y-6 pt-6">
          <PushNotificationSettings />
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="pt-6">
          <ThemeSettings />
        </CardContent>
      </Card>
    </AccountShell>
  );
}
