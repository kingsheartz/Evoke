"use client";

import { NotificationProvider } from "@/lib/notifications";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
