"use client";

import { AccountShell } from "@/components/account/account-shell";
import { ThemeSettings } from "@/components/theme/theme-settings";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/app";

export default function AccountSettingsPage() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <AccountShell title="Theme & display" description="Choose how Evoke looks on your device.">
      <Card variant="glass">
        <CardContent className="pt-6">
          <ThemeSettings />
        </CardContent>
      </Card>
    </AccountShell>
  );
}
