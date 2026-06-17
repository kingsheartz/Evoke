"use client";

import { Suspense } from "react";
import { UserPlus } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthPageShell
      badge={
        <div className="inline-flex items-center gap-2.5 rounded-full border border-app-border/80 bg-app-surface/60 px-4 py-1.5 text-xs text-app-muted backdrop-blur-sm">
          <UserPlus className="h-3.5 w-3.5 shrink-0 text-accent-soft" />
          <span>Join the Evoke platform</span>
        </div>
      }
    >
      <Suspense fallback={<div className="h-[28rem] w-full animate-pulse rounded-2xl bg-white/[0.03]" />}>
        <RegisterForm />
      </Suspense>
    </AuthPageShell>
  );
}
