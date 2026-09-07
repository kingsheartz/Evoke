"use client";

import { Suspense } from "react";
import { EmailLinkSignInPage } from "@/components/auth/email-link-sign-in-page";

export default function SignInEmailLinkRoute() {
  return (
    <Suspense fallback={<div className="h-80 w-full animate-pulse rounded-2xl bg-white/[0.03]" />}>
      <EmailLinkSignInPage />
    </Suspense>
  );
}
