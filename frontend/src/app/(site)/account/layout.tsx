"use client";

import { CustomerAuthGuard } from "@/components/auth/customer-auth-guard";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <CustomerAuthGuard>{children}</CustomerAuthGuard>;
}
