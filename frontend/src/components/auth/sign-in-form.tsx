"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, getUserPermissions, getUserRoles, hasAdminAccess } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { useAuthStore } from "@/stores/app";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setContext } = useAuthStore();
  const { error: notifyError, success: notifySuccess } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const mounted = useClientMounted();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const { data: auth } = await apiClient.login(data.email, data.password);
      setAuth(auth.user, auth.token);

      const roles = getUserRoles(auth.user);
      const permissions = getUserPermissions(auth.user);

      if (hasAdminAccess(roles, permissions)) {
        const { data: context } = await apiClient.getAdminContext(auth.token);
        setContext(context);
        notifySuccess("Signed in. Redirecting to admin...");
        router.push(searchParams.get("redirect") ?? "/admin");
        return;
      }

      notifySuccess("Welcome back!");
      const redirect = searchParams.get("redirect") ?? "/account";
      router.push(redirect);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-status-error">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-xs text-status-error">{errors.password.message}</p>}
          </div>
          {error && (
            <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error ring-1 ring-status-error/20">{error}</p>
          )}
          <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting} suppressHydrationWarning>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        )}
        <p className="mt-6 text-center text-sm text-app-muted">
          New to Evoke?{" "}
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
