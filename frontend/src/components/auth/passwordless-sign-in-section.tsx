"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/lib/notifications";
import { mapFirebaseAuthError, sendPasswordlessSignInLink } from "@/lib/firebase-auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export function PasswordlessSignInSection() {
  const searchParams = useSearchParams();
  const { error: notifyError, success: notifySuccess } = useNotifications();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await sendPasswordlessSignInLink(data.email, searchParams.get("redirect"));
      setSent(true);
      notifySuccess("Sign-in link sent. Check your inbox.");
    } catch (err) {
      const message = mapFirebaseAuthError(err, "Could not send sign-in link.");
      setError(message);
      notifyError(message);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-app-border bg-app-surface-muted/40 p-4 text-sm text-app-muted">
        <p className="font-medium text-app-text">Check your email</p>
        <p className="mt-1">
          We sent a sign-in link to your inbox. Open it on this device to continue. Links expire after a
          short time.
        </p>
        <Button type="button" variant="ghost" className="mt-3 h-auto px-0 text-accent-soft" onClick={() => setSent(false)}>
          Send another link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="passwordless-email">Email for sign-in link</Label>
        <Input id="passwordless-email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? <p className="text-xs text-status-error">{errors.email.message}</p> : null}
      </div>
      {error ? (
        <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error ring-1 ring-status-error/20">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending link…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
