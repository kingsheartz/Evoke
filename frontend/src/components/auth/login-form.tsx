"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, getDefaultAdminPath, hasAdminAccess } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { useAuthStore } from "@/stores/app";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setContext } = useAuthStore();
  const { error: notifyError } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const mounted = useClientMounted();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@evoke.com", password: "password" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const { data: auth } = await apiClient.login(data.email, data.password);
      setAuth(auth.user, auth.token);

      const roles = auth.user.roles?.map((r) => r.name) ?? [];
      const permissions = auth.user.permissions?.map((p) => p.name) ?? [];

      if (!hasAdminAccess(roles, permissions)) {
        const message = "You do not have admin access.";
        setError(message);
        notifyError(message);
        useAuthStore.getState().logout();
        return;
      }

      const { data: context } = await apiClient.getAdminContext(auth.token);
      setContext(context);

      const redirect = searchParams.get("redirect") ?? getDefaultAdminPath(context.navigation);
      router.push(redirect);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
      notifyError(message);
    }
  };

  return (
    <Card variant="glass" className="relative w-full max-w-md overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <CardHeader>
        <CardTitle>Admin Sign In</CardTitle>
        <p className="text-sm text-app-muted">Sign in to manage the EOKE platform</p>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <AuthFormSkeleton />
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-status-error">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-status-error">{errors.password.message}</p>
            )}
          </div>
          {error && <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error ring-1 ring-status-error/20">{error}</p>}
          <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting} suppressHydrationWarning>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        )}
        <p className="mt-6 text-center text-xs text-app-muted">
          Customer account?{" "}
          <Link href="/sign-in" className="text-accent-soft hover:text-accent">
            Sign in here
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
