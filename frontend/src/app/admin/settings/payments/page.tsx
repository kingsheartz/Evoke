"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_CONTACT_EMAIL, DEFAULT_WHATSAPP_E164 } from "@/lib/contact";
import { apiClient, type PaymentsSettingsPayload } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

const EMPTY: PaymentsSettingsPayload = {
  razorpay_enabled: false,
  payment_link_url: "",
  payment_link_label: "Pay online",
  contact_email: DEFAULT_CONTACT_EMAIL,
  contact_whatsapp: DEFAULT_WHATSAPP_E164,
};

export default function PaymentsSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error } = useNotifications();
  const [form, setForm] = useState<PaymentsSettingsPayload>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiClient
      .getPaymentsSettings(token)
      .then((response) => {
        const data = response.data;
        setForm({
          razorpay_enabled: data?.razorpay_enabled ?? false,
          payment_link_url: data?.payment_link_url ?? "",
          payment_link_label: data?.payment_link_label ?? "Pay online",
          contact_email: data?.contact_email ?? DEFAULT_CONTACT_EMAIL,
          contact_whatsapp: data?.contact_whatsapp ?? DEFAULT_WHATSAPP_E164,
        });
      })
      .catch(() => setForm(EMPTY));
  }, [token]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload: PaymentsSettingsPayload = {
        razorpay_enabled: form.razorpay_enabled,
        payment_link_url: form.payment_link_url?.trim() || null,
        payment_link_label: form.payment_link_label?.trim() || "Pay online",
        contact_email: form.contact_email?.trim() || DEFAULT_CONTACT_EMAIL,
        contact_whatsapp: form.contact_whatsapp?.replace(/\D/g, "") || DEFAULT_WHATSAPP_E164,
      };
      await apiClient.updatePaymentsSettings(token, payload);
      success("Payments and contact settings saved.");
    } catch (e) {
      error(e instanceof Error ? e.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate permission="platform.manage">
      <div className="app-page space-y-6">
        <PageHeader
          title="Payments & contact"
          description="Default checkout uses the external payment link. Razorpay stays off until you enable it here."
          actions={
            <ActionButton icon={Save} loading={saving} data-admin-primary-save="true" onClick={save}>
              Save settings
            </ActionButton>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Customers are sent to your payment link after placing orders, bookings, or enrollments.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="payment-link-url">Payment link URL</Label>
              <Input
                id="payment-link-url"
                value={form.payment_link_url ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, payment_link_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-link-label">Payment button label</Label>
              <Input
                id="payment-link-label"
                value={form.payment_link_label ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, payment_link_label: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-app-border p-4">
              <div>
                <p className="text-sm font-medium text-app-text">Razorpay checkout</p>
                <p className="text-xs text-app-muted">Disabled by default. Enable only when keys are configured on the server.</p>
              </div>
              <Switch
                checked={form.razorpay_enabled}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, razorpay_enabled: checked }))}
                aria-label="Enable Razorpay"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Used for WhatsApp CTAs and outbound email defaults.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact email</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.contact_email ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, contact_email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-whatsapp">WhatsApp number</Label>
              <Input
                id="contact-whatsapp"
                value={form.contact_whatsapp ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, contact_whatsapp: e.target.value }))}
                placeholder="+91 79022 64073"
              />
              <p className="text-xs text-app-muted">Digits only in storage, e.g. 917902264073</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
