"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { useCompleteCustomerAuthHandlers } from "@/hooks/use-complete-customer-auth";
import { useNotifications } from "@/lib/notifications";
import {
  completePasswordlessSignInLink,
  getStoredPasswordlessEmail,
  isPasswordlessEmailLink,
  mapFirebaseAuthError,
} from "@/lib/firebase-auth";
import { isFirebaseAuthConfigured } from "@/lib/firebase-config";

export function EmailLinkSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleFirebaseToken } = useCompleteCustomerAuthHandlers();
  const { error: notifyError } = useNotifications();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"checking" | "needs-email" | "submitting" | "failed">("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseAuthConfigured()) {
      setStatus("failed");
      setMessage("Passwordless sign-in is not configured for this environment.");
      return;
    }

    if (!isPasswordlessEmailLink(window.location.href)) {
      router.replace("/sign-in");
      return;
    }

    const storedEmail = getStoredPasswordlessEmail();
    if (!storedEmail) {
      setStatus("needs-email");
      return;
    }

    setEmail(storedEmail);

    void (async () => {
      setStatus("submitting");
      setMessage(null);
      try {
        const idToken = await completePasswordlessSignInLink(storedEmail, window.location.href);
        await handleFirebaseToken(idToken);
      } catch (error) {
        const text = mapFirebaseAuthError(error, "Could not complete sign-in.");
        setStatus("needs-email");
        setMessage(text);
        notifyError(text);
      }
    })();
  }, [handleFirebaseToken, notifyError, router]);

  const finishSignIn = async (address: string) => {
    setStatus("submitting");
    setMessage(null);
    try {
      const idToken = await completePasswordlessSignInLink(address, window.location.href);
      await handleFirebaseToken(idToken);
    } catch (error) {
      const text = mapFirebaseAuthError(error, "Could not complete sign-in.");
      setStatus("needs-email");
      setMessage(text);
      notifyError(text);
    }
  };

  if (status === "failed") {
    return (
      <AuthPageShell
        badge={
          <div className="inline-flex items-center gap-2.5 rounded-full border border-app-border/80 bg-app-surface/60 px-4 py-1.5 text-xs text-app-muted backdrop-blur-sm">
            <Mail className="h-3.5 w-3.5 shrink-0 text-accent-soft" />
            <span>Email sign-in link</span>
          </div>
        }
      >
        <Card variant="glass" className="w-full">
          <CardContent className="space-y-4 py-8 text-center">
            <p className="text-sm text-status-error">{message}</p>
            <Link href="/sign-in" className="text-sm text-accent-soft hover:text-accent">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </AuthPageShell>
    );
  }

  if (status === "checking" || status === "submitting") {
    return (
      <AuthPageShell
        badge={
          <div className="inline-flex items-center gap-2.5 rounded-full border border-app-border/80 bg-app-surface/60 px-4 py-1.5 text-xs text-app-muted backdrop-blur-sm">
            <Mail className="h-3.5 w-3.5 shrink-0 text-accent-soft" />
            <span>Email sign-in link</span>
          </div>
        }
      >
        <Card variant="glass" className="w-full">
          <CardContent className="py-10 text-center text-sm text-app-muted">
            {status === "submitting" ? "Completing sign-in…" : "Checking your sign-in link…"}
          </CardContent>
        </Card>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      badge={
        <div className="inline-flex items-center gap-2.5 rounded-full border border-app-border/80 bg-app-surface/60 px-4 py-1.5 text-xs text-app-muted backdrop-blur-sm">
          <Mail className="h-3.5 w-3.5 shrink-0 text-accent-soft" />
          <span>Email sign-in link</span>
        </div>
      }
    >
      <Card variant="glass" className="w-full">
        <CardHeader>
          <CardTitle>Confirm your email</CardTitle>
          <p className="text-sm text-app-muted">
            Enter the email address where you received the sign-in link.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void finishSignIn(email);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email-link-email">Email</Label>
              <Input
                id="email-link-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {message ? (
              <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error ring-1 ring-status-error/20">
                {message}
              </p>
            ) : null}
            <Button type="submit" variant="glow" className="w-full">
              Continue
            </Button>
          </form>
          <p className="text-center text-sm text-app-muted">
            <Link href={`/sign-in${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`} className="text-accent-soft hover:text-accent">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}
