"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { apiClient } from "@/lib/api";
import { DEFAULT_WHATSAPP_E164, tourWhatsAppMessage } from "@/lib/contact";
import { completeCheckoutPayment } from "@/lib/payments";
import { profileCompletionMessage } from "@/lib/profile";
import { revalidateTourPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

function toDateInput(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.slice(0, 10);
}

export function TourBookingAction({
  packageId,
  packageTitle,
  redirectPath,
  availableFrom,
  availableUntil,
  variant = "stack",
}: {
  packageId: number;
  packageTitle?: string;
  redirectPath: string;
  availableFrom?: string | null;
  availableUntil?: string | null;
  /** `bar` = compact inline CTA used in TourPackageActions */
  variant?: "stack" | "bar";
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [requests, setRequests] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const minDate = toDateInput(availableFrom);
  const maxDate = toDateInput(availableUntil);
  const profileMessage = user ? profileCompletionMessage(user) : null;

  const dateHint = useMemo(() => {
    if (minDate && maxDate) return `Travel between ${minDate} and ${maxDate}.`;
    if (minDate) return `Earliest travel date: ${minDate}.`;
    if (maxDate) return `Latest travel date: ${maxDate}.`;
    return null;
  }, [minDate, maxDate]);

  const signInHref = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`;
  const profileHref = `/account/profile?redirect=${encodeURIComponent(redirectPath)}`;

  const submit = async () => {
    if (!token || !user) {
      router.push(signInHref);
      return;
    }
    if (profileMessage) {
      setMessage(profileMessage);
      return;
    }
    if (!travelDate) {
      setMessage("Choose a travel date.");
      return;
    }
    if (minDate && travelDate < minDate) {
      setMessage(`Travel date must be on or after ${minDate}.`);
      return;
    }
    if (maxDate && travelDate > maxDate) {
      setMessage(`Travel date must be on or before ${maxDate}.`);
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await apiClient.createBooking(token, {
        package_id: packageId,
        travel_date: travelDate,
        travelers_count: travelers,
        special_requests: requests.trim() || undefined,
      });
      await revalidateTourPublicCache();

      await completeCheckoutPayment({
        token,
        payableType: "tour_booking",
        payableId: response.data.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone ?? undefined,
      });

      router.push(`/confirmation?type=booking&ref=${encodeURIComponent(response.data.booking_number)}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not submit booking.");
      setSubmitting(false);
    }
  };

  if (!open) {
    if (variant === "bar") {
      return (
        <Button
          type="button"
          className="h-12 w-full rounded-xl px-6 text-sm font-semibold sm:w-auto sm:min-w-[9rem]"
          onClick={() => (token ? setOpen(true) : router.push(signInHref))}
        >
          Book now
        </Button>
      );
    }

    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          className="h-12 w-full rounded-xl px-6 text-sm font-semibold sm:w-auto"
          onClick={() => (token ? setOpen(true) : router.push(signInHref))}
        >
          Book now
        </Button>
        {packageTitle && (
          <WhatsAppButton
            phone={DEFAULT_WHATSAPP_E164}
            message={tourWhatsAppMessage(packageTitle)}
            label="Chat on WhatsApp"
            className="h-12 w-full rounded-xl sm:w-auto"
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", variant === "bar" ? "basis-full" : "max-w-md")}>
      <div className="rounded-xl border border-app-border bg-app-surface p-4 ring-1 ring-app-border">
        <div className="grid gap-3">
          {profileMessage && (
            <p className="text-sm text-status-error">
              {profileMessage}{" "}
              <Link href={profileHref} className="font-medium text-accent-soft hover:text-accent">
                Update profile
              </Link>
            </p>
          )}
          <div className="space-y-2">
            <Label>Travel date</Label>
            <Input
              type="date"
              value={travelDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => setTravelDate(e.target.value)}
            />
            {dateHint && <p className="text-xs text-app-muted">{dateHint}</p>}
          </div>
          <div className="space-y-2">
            <Label>Travelers</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Special requests (optional)</Label>
            <Textarea rows={2} value={requests} onChange={(e) => setRequests(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button type="button" className="w-full sm:w-auto" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit booking"}
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
      {message && <p className="mt-2 text-sm text-status-error">{message}</p>}
    </div>
  );
}
