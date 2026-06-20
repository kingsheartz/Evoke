"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";

export function TourEnquiryAction({
  packageId,
  packageTitle,
}: {
  packageId?: number;
  packageTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelers_count: 2,
    preferred_date: "",
    message: "",
  });

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setMessage("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await apiClient.createTourEnquiry({
        package_id: packageId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        travelers_count: form.travelers_count,
        preferred_date: form.preferred_date || undefined,
        message: form.message.trim() || undefined,
      });
      window.location.href = `/confirmation?type=enquiry&ref=${encodeURIComponent(packageTitle ?? "Tour")}`;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not send enquiry.");
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <Button type="button" variant="outline" className="h-12 rounded-xl px-6" onClick={() => setOpen(true)}>
        Ask a question
      </Button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-app-border bg-app-surface p-4">
      <p className="mb-3 text-sm font-medium text-app-text">Tour enquiry{packageTitle ? `: ${packageTitle}` : ""}</p>
      <div className="grid gap-3">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Preferred date</Label>
          <Input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? "Sending…" : "Send enquiry"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
        {message && <p className="text-sm text-status-error">{message}</p>}
      </div>
    </div>
  );
}
