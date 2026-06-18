"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { useAuthStore } from "@/stores/app";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { error: notifyError, success: notifySuccess } = useNotifications();
  const [error, setError] = useState<string | null>(null);
  const mounted = useClientMounted();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const { data: auth } = await apiClient.register({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      setAuth(auth.user, auth.token);
      notifySuccess("Account created successfully!");
      router.push("/account");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registration failed";
      setError(message);
      notifyError(message);
    }
  };

  return (
    <Card variant="glass" className="relative w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <p className="text-sm text-app-muted">Name, email, and password only — add photo & address later in My account.</p>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <AuthFormSkeleton />
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            {errors.name && <p className="text-xs text-status-error">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-status-error">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p className="text-xs text-status-error">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm password</Label>
            <Input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              {...register("password_confirmation")}
            />
            {errors.password_confirmation && (
              <p className="text-xs text-status-error">{errors.password_confirmation.message}</p>
            )}
          </div>
          {error && (
            <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error ring-1 ring-status-error/20">{error}</p>
          )}
          <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting} suppressHydrationWarning>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        )}
        <p className="mt-6 text-center text-sm text-app-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-accent-soft hover:text-accent">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
