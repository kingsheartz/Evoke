"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";

export function NewsletterSubscribe({
  className,
  compact = false,
  inline = false,
}: {
  className?: string;
  compact?: boolean;
  inline?: boolean;
}) {
  const { success, error: notifyError } = useNotifications();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;

    setSubmitting(true);
    try {
      const response = await apiClient.subscribeNewsletter(value);
      success(response.message ?? "Subscribed successfully.");
      setEmail("");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not subscribe.");
    } finally {
      setSubmitting(false);
    }
  };

  if (inline) {
    return (
      <form
        onSubmit={submit}
        className={cn("flex w-full flex-col gap-2 sm:flex-row sm:items-center", className)}
      >
        <Input
          id="newsletter-email-inline"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email for updates"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 min-w-0 flex-1"
        />
        <Button
          type="submit"
          disabled={submitting || !email.trim()}
          className="h-10 w-full shrink-0 sm:w-auto sm:min-w-[7.25rem]"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className={className}>
      <label htmlFor="newsletter-email" className="text-xs font-semibold uppercase tracking-wider text-app-muted">
        Newsletter
      </label>
      <p className={`mt-2 text-app-muted ${compact ? "text-xs leading-relaxed" : "text-sm"}`}>
        Get updates on courses, tours, and shop drops.
      </p>
      <div className={`mt-4 flex flex-col gap-2 ${compact ? "" : "sm:flex-row"}`}>
        <Input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-w-0 flex-1"
        />
        <Button type="submit" disabled={submitting || !email.trim()} className="shrink-0">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>
    </form>
  );
}
