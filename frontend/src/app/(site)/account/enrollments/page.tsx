"use client";

import { AccountShell } from "@/components/account/account-shell";
import { EnrollmentHistoryList } from "@/components/account/enrollment-history-list";
import { useAuthStore } from "@/stores/app";

export default function AccountEnrollmentsPage() {
  const { token } = useAuthStore();
  if (!token) return null;

  return (
    <AccountShell title="Course enrollments" description="View your academy enrollments and payment status.">
      <EnrollmentHistoryList token={token} />
    </AccountShell>
  );
}
