"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, hasAdminAccess } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
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

      const redirect = searchParams.get("redirect") ?? "/admin";
      router.push(redirect);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
      notifyError(message);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin Sign In</CardTitle>
        <p className="text-sm text-app-muted">Sign in to manage Evoke Platform</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" suppressHydrationWarning {...register("email")} />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" suppressHydrationWarning {...register("password")} />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
