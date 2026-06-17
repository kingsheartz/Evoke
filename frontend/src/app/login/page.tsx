"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthPageShell
      badge={
        <div className="inline-flex items-center gap-2.5 rounded-full border border-app-border/80 bg-app-surface/60 px-4 py-1.5 text-xs text-app-muted backdrop-blur-sm">
          <Shield className="h-3.5 w-3.5 shrink-0 text-accent-soft" />
          <span>Secure administration portal</span>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="h-80 w-full animate-pulse rounded-2xl bg-white/[0.03]" />
        }
      >
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-xs text-app-muted">
        Customer?{" "}
        <Link href="/sign-in" className="text-accent-soft hover:text-accent">
          Sign in to your account
        </Link>
      </p>
    </AuthPageShell>
  );
}
