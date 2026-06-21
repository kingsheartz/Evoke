"use client";

import { AccountShell } from "@/components/account/account-shell";
import { OrderHistoryList } from "@/components/account/order-history-list";
import { useAuthStore } from "@/stores/app";

export default function AccountOrdersPage() {
  const { token } = useAuthStore();
  if (!token) return null;

  return (
    <AccountShell title="Shop orders" description="Track status and payment for your product orders.">
      <OrderHistoryList token={token} />
    </AccountShell>
  );
}
