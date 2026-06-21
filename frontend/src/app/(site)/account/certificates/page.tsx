"use client";

import { AccountShell } from "@/components/account/account-shell";
import { CertificateList } from "@/components/account/certificate-list";
import { useAuthStore } from "@/stores/app";

export default function AccountCertificatesPage() {
  const { token } = useAuthStore();
  if (!token) return null;

  return (
    <AccountShell title="Certificates" description="Certificates issued for completed academy courses.">
      <CertificateList token={token} />
    </AccountShell>
  );
}
