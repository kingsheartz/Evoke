"use client";

import { NotificationProvider } from "@/lib/notifications";
import { ProcessModalProvider } from "@/lib/process-modal";
import { BrandFavicon } from "@/components/brand/brand-favicon";
import { BrandProvider } from "@/components/providers/brand-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BrandProvider>
        <BrandFavicon />
        <NotificationProvider>
          <ProcessModalProvider>{children}</ProcessModalProvider>
        </NotificationProvider>
      </BrandProvider>
    </ThemeProvider>
  );
}
