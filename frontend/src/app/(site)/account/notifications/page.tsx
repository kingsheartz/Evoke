"use client";

import { AccountShell } from "@/components/account/account-shell";
import { NotificationInbox } from "@/components/account/notification-inbox";
import { useAuthStore } from "@/stores/app";

export default function AccountNotificationsPage() {
  const { token } = useAuthStore();
  if (!token) return null;

  return (
    <AccountShell
      title="Notifications"
      description="Order, enrollment, booking, and certificate updates from Evoke."
    >
      <NotificationInbox token={token} />
    </AccountShell>
  );
}
