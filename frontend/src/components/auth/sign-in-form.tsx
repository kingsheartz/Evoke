"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/lib/notifications";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { AuthDivider, FirebaseGoogleSignInButton } from "@/components/auth/firebase-google-sign-in-button";
import { PasswordlessSignInSection } from "@/components/auth/passwordless-sign-in-section";
import { isFirebaseAuthConfigured } from "@/lib/firebase-config";
import {
  isFirebaseAuthCredentialError,
  mapFirebaseAuthError,
  signInWithEmailPasswordIdToken,
} from "@/lib/firebase-auth";
import { useCompleteCustomerAuthHandlers, useLegacyEmailPasswordSignIn } from "@/hooks/use-complete-customer-auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;
type SignInMode = "password" | "email-link";

export function SignInForm() {
  const { error: notifyError } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<SignInMode>("password");
  const mounted = useClientMounted();
  const firebaseAuth = isFirebaseAuthConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const { handleFirebaseToken } = useCompleteCustomerAuthHandlers();
  const legacySignIn = useLegacyEmailPasswordSignIn();

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      if (firebaseAuth) {
        try {
          const idToken = await signInWithEmailPasswordIdToken(data.email, data.password);
          await handleFirebaseToken(idToken);
          return;
        } catch (firebaseError) {
          if (!isFirebaseAuthCredentialError(firebaseError)) {
            throw new Error(mapFirebaseAuthError(firebaseError, "Sign in failed"));
          }
        }
      }

      await legacySignIn(data.email, data.password);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign in failed";
      setError(message);
      notifyError(message);
    }
  };

  return (
    <Card variant="glass" className="relative w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <p className="text-sm text-app-muted">Access your orders, enrollments, and bookings</p>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <AuthFormSkeleton />
        ) : (
          <div className="space-y-5">
            <FirebaseGoogleSignInButton
              onToken={handleFirebaseToken}
              onError={(message) => {
                setError(message);
                notifyError(message);
              }}
              disabled={isSubmitting}
            />
            <AuthDivider />

            {firebaseAuth ? (
              <div className="flex gap-2 rounded-xl border border-app-border bg-app-surface-muted/30 p-1">
                <Button
                  type="button"
                  variant={mode === "password" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setMode("password")}
                >
                  Password
                </Button>
                <Button
                  type="button"
                  variant={mode === "email-link" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setMode("email-link")}
                >
                  Email link
                </Button>
              </div>
            ) : null}

            {mode === "email-link" && firebaseAuth ? (
              <Suspense fallback={<p className="text-sm text-app-muted">Loading…</p>}>
                <PasswordlessSignInSection />
              </Suspense>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" {...register("email")} />
                  {errors.email ? <p className="text-xs text-status-error">{errors.email.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
                  {errors.password ? <p className="text-xs text-status-error">{errors.password.message}</p> : null}
                </div>
                {error ? (
                  <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error ring-1 ring-status-error/20">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting} suppressHydrationWarning>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            )}
          </div>
        )}
        <p className="mt-6 text-center text-sm text-app-muted">
          New to EOKE?{" "}
          <Link href="/register" className="font-medium text-accent-soft hover:text-accent">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-app-muted">
          Staff member?{" "}
          <Link href="/login" className="text-accent-soft hover:text-accent">
            Admin portal
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
