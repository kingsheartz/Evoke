"use client";

import { Suspense } from "react";
import { User } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthPageShell
      badge={
        <div className="inline-flex items-center gap-2.5 rounded-full border border-app-border/80 bg-app-surface/60 px-4 py-1.5 text-xs text-app-muted backdrop-blur-sm">
          <User className="h-3.5 w-3.5 shrink-0 text-accent-soft" />
          <span>Your EOKE account</span>
        </div>
      }
    >
      <Suspense fallback={<div className="h-80 w-full animate-pulse rounded-2xl bg-white/[0.03]" />}>
        <SignInForm />
      </Suspense>
    </AuthPageShell>
  );
}
