"use client";

import { useState } from "react";
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

function toDateInput(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.slice(0, 10);
}

type Panel = "booking" | "enquiry" | null;

/** Compact CTA row for tour package heroes — horizontal actions, panels below. */
export function TourPackageActions({
  packageId,
  packageTitle,
  redirectPath,
  availableFrom,
  availableUntil,
}: {
  packageId: number;
  packageTitle: string;
  redirectPath: string;
  availableFrom?: string | null;
  availableUntil?: string | null;
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [panel, setPanel] = useState<Panel>(null);

  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [requests, setRequests] = useState("");
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const [enquiry, setEnquiry] = useState({
    name: "",
    email: "",
    phone: "",
    travelers_count: 2,
    preferred_date: "",
    message: "",
  });
  const [enquiryMessage, setEnquiryMessage] = useState<string | null>(null);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);

  const minDate = toDateInput(availableFrom);
  const maxDate = toDateInput(availableUntil);
  const profileMessage = user ? profileCompletionMessage(user) : null;
  const signInHref = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`;
  const profileHref = `/account/profile?redirect=${encodeURIComponent(redirectPath)}`;
  const whatsappMessage = tourWhatsAppMessage(packageTitle);

  const openBooking = () => {
    if (!token) {
      router.push(signInHref);
      return;
    }
    setPanel("booking");
  };

  const submitBooking = async () => {
    if (!token || !user) {
      router.push(signInHref);
      return;
    }
    if (profileMessage) {
      setBookingMessage(profileMessage);
      return;
    }
    if (!travelDate) {
      setBookingMessage("Choose a travel date.");
      return;
    }
    if (minDate && travelDate < minDate) {
      setBookingMessage(`Travel date must be on or after ${minDate}.`);
      return;
    }
    if (maxDate && travelDate > maxDate) {
      setBookingMessage(`Travel date must be on or before ${maxDate}.`);
      return;
    }
    setBookingSubmitting(true);
    setBookingMessage(null);
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
      setBookingMessage(e instanceof Error ? e.message : "Could not submit booking.");
      setBookingSubmitting(false);
    }
  };

  const submitEnquiry = async () => {
    if (!enquiry.name.trim() || !enquiry.email.trim()) {
      setEnquiryMessage("Name and email are required.");
      return;
    }
    setEnquirySubmitting(true);
    setEnquiryMessage(null);
    try {
      await apiClient.createTourEnquiry({
        package_id: packageId,
        name: enquiry.name.trim(),
        email: enquiry.email.trim(),
        phone: enquiry.phone.trim() || undefined,
        travelers_count: enquiry.travelers_count,
        preferred_date: enquiry.preferred_date || undefined,
        message: enquiry.message.trim() || undefined,
      });
      window.location.href = `/confirmation?type=enquiry&ref=${encodeURIComponent(packageTitle)}`;
    } catch (e) {
      setEnquiryMessage(e instanceof Error ? e.message : "Could not send enquiry.");
      setEnquirySubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 lg:items-end">
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
        <Button
          type="button"
          className="h-12 w-full rounded-xl px-6 text-sm font-semibold sm:w-auto sm:min-w-[9rem]"
          onClick={openBooking}
        >
          Book now
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-xl px-6 sm:w-auto sm:min-w-[9rem]"
          onClick={() => setPanel("enquiry")}
        >
          Ask a question
        </Button>
        <WhatsAppButton
          phone={DEFAULT_WHATSAPP_E164}
          message={whatsappMessage}
          label="WhatsApp"
          className="h-12 w-full rounded-xl sm:w-auto sm:min-w-[8.5rem]"
        />
      </div>

      {panel === "booking" && (
        <div className="w-full max-w-md rounded-xl border border-app-border bg-app-surface p-4 ring-1 ring-app-border lg:ml-auto">
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
              {(minDate || maxDate) && (
                <p className="text-xs text-app-muted">
                  {minDate && maxDate
                    ? `Travel between ${minDate} and ${maxDate}.`
                    : minDate
                      ? `Earliest travel date: ${minDate}.`
                      : `Latest travel date: ${maxDate}.`}
                </p>
              )}
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={submitBooking} disabled={bookingSubmitting}>
                {bookingSubmitting ? "Submitting…" : "Submit booking"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setPanel(null)}>
                Cancel
              </Button>
            </div>
            {bookingMessage && <p className="text-sm text-status-error">{bookingMessage}</p>}
          </div>
        </div>
      )}

      {panel === "enquiry" && (
        <div className="w-full max-w-md rounded-xl border border-app-border bg-app-surface p-4 ring-1 ring-app-border lg:ml-auto">
          <p className="mb-3 text-sm font-medium text-app-text">Tour enquiry: {packageTitle}</p>
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={enquiry.email}
                onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={enquiry.phone} onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Preferred date</Label>
              <Input
                type="date"
                value={enquiry.preferred_date}
                onChange={(e) => setEnquiry({ ...enquiry, preferred_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                rows={3}
                value={enquiry.message}
                onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={submitEnquiry} disabled={enquirySubmitting}>
                {enquirySubmitting ? "Sending…" : "Send enquiry"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setPanel(null)}>
                Cancel
              </Button>
            </div>
            {enquiryMessage && <p className="text-sm text-status-error">{enquiryMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
