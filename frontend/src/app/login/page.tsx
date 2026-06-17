"use client";

import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <Link href="/" className="mb-8 text-xl font-bold text-zinc-900">
        Evoke
      </Link>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
