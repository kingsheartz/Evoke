"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { revalidateTourPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";

export function TourBookingAction({
  packageId,
  redirectPath,
}: {
  packageId: number;
  redirectPath: string;
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [requests, setRequests] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signInHref = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`;

  const submit = async () => {
    if (!token || !user) {
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
      const response = await apiClient.createBooking(token, {
        package_id: packageId,
        travel_date: travelDate,
        travelers_count: travelers,
        special_requests: requests.trim() || undefined,
      });
      await revalidateTourPublicCache();

      try {
        await openRazorpayCheckout({
          token,
          payableType: "tour_booking",
          payableId: response.data.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone ?? undefined,
        });
      } catch {
        // Payment optional when Razorpay is not configured
      }

      router.push(`/confirmation?type=booking&ref=${encodeURIComponent(response.data.booking_number)}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not submit booking.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-3 sm:items-end">
      {!open ? (
        <Button
          type="button"
          className="h-12 w-full rounded-xl px-6 text-sm font-semibold sm:w-auto"
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
      )}
      {message && <p className="text-sm text-status-error">{message}</p>}
    </div>
  );
}
