"use client";

import { NotificationProvider } from "@/lib/notifications";
import { ProcessModalProvider } from "@/lib/process-modal";
import { BrandFavicon } from "@/components/brand/brand-favicon";
import { PushNotificationProvider } from "@/components/notifications/push-notification-provider";
import { BrandProvider } from "@/components/providers/brand-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BrandProvider>
        <BrandFavicon />
        <NotificationProvider>
          <PushNotificationProvider>
            <ProcessModalProvider>{children}</ProcessModalProvider>
          </PushNotificationProvider>
        </NotificationProvider>
      </BrandProvider>
    </ThemeProvider>
  );
}
