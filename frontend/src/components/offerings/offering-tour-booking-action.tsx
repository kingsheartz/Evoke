"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export function TourBookingAction({
  packageId,
  redirectPath,
}: {
  packageId: number;
  redirectPath: string;
}) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [requests, setRequests] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signInHref = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`;

  const submit = async () => {
    if (!token) {
      router.push(signInHref);
      return;
    }
    if (!travelDate) {
      setMessage("Choose a travel date.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await apiClient.createBooking(token, {
        package_id: packageId,
        travel_date: travelDate,
        travelers_count: travelers,
        special_requests: requests.trim() || undefined,
      });
      setMessage("Booking request submitted. We will confirm shortly.");
      setOpen(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not submit booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-3 sm:items-end">
      {!open ? (
        <Button
          type="button"
          className="h-12 rounded-xl px-6 text-sm font-semibold"
          onClick={() => (token ? setOpen(true) : router.push(signInHref))}
        >
          Book now
        </Button>
      ) : (
        <div className="w-full max-w-md rounded-xl border border-app-border bg-app-surface p-4 ring-1 ring-app-border">
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Travel date</Label>
              <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
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
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit booking"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {message && (
        <p className={`text-sm ${message.includes("submitted") ? "text-status-success" : "text-status-error"}`}>
          {message}
          {message.includes("submitted") && (
            <>
              {" "}
              <Link href="/account" className="font-medium text-accent-soft hover:text-accent">
                View account
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
