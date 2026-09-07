"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { apiClient, ApiError } from "@/lib/api";
import { signOutFirebaseUser } from "@/lib/firebase-auth";
import { unregisterPushToken } from "@/lib/firebase-messaging";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export function AccountDeleteSettings({ email }: { email: string }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const { error: notifyError, success: notifySuccess } = useNotifications();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!token) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      try {
        await unregisterPushToken(token);
      } catch {
        // Best effort before account removal.
      }

      await apiClient.deleteAccount(token, {
        email: confirmEmail.trim(),
        ...(password ? { password } : {}),
      });

      await signOutFirebaseUser();
      logout();
      notifySuccess("Your account has been deleted.");
      router.push("/");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not delete account.";
      setError(message);
      notifyError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Trash2 className="mt-0.5 size-5 text-status-error" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium text-app-text">Delete account</p>
          <p className="text-sm text-app-muted">
            Permanently remove your Evoke account and Firebase sign-in (Google, email, or email link).
            Order and enrollment history may be kept for records but will no longer be linked to you.
          </p>
        </div>
      </div>

      {!open ? (
        <Button type="button" variant="outline" className="border-status-error/40 text-status-error" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      ) : (
        <div className="space-y-4 rounded-xl border border-status-error/30 bg-status-error/5 p-4">
          <p className="text-sm text-app-muted">
            Type <span className="font-medium text-app-text">{email}</span> to confirm. This cannot be undone.
          </p>
          <div className="space-y-2">
            <Label htmlFor="delete-account-email">Email</Label>
            <Input
              id="delete-account-email"
              type="email"
              autoComplete="email"
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delete-account-password">Password (only if you sign in with email and password)</Label>
            <PasswordInput
              id="delete-account-password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error ring-1 ring-status-error/20">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={busy || confirmEmail.trim().toLowerCase() !== email.toLowerCase()}
              onClick={() => void handleDelete()}
            >
              {busy ? "Deleting…" : "Permanently delete account"}
            </Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
