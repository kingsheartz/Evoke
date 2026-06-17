"use client";

import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { PageIllustration } from "@/components/layout/page-illustration";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-app-bg px-4 pt-20">
      <PageIllustration />
      <Link href="/" className="relative mb-8 text-2xl font-bold tracking-tight text-app-text">
        Evoke
      </Link>
      <p className="relative mb-6 text-sm text-app-muted">Administration portal</p>
      <Suspense fallback={<p className="text-sm text-app-muted">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
