"use client";

import { AccountShell } from "@/components/account/account-shell";
import { BookingHistoryList } from "@/components/account/booking-history-list";
import { useAuthStore } from "@/stores/app";

export default function AccountBookingsPage() {
  const { token } = useAuthStore();
  if (!token) return null;

  return (
    <AccountShell title="Tour bookings" description="View your travel bookings and trip details.">
      <BookingHistoryList token={token} />
    </AccountShell>
  );
}
