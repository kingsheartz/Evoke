"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/api";

export type DeliveryAddressFields = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
};

export function deliveryAddressFromUser(user: User): DeliveryAddressFields {
  return {
    name: user.name,
    line1: user.address_line1 ?? "",
    line2: user.address_line2 ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    postal_code: user.postal_code ?? "",
    country: user.country ?? "IN",
    phone: user.phone ?? "",
  };
}

export function isDeliveryAddressComplete(address: DeliveryAddressFields): boolean {
  return Boolean(address.line1.trim() && address.city.trim() && address.postal_code.trim());
}

export function deliveryAddressToPayload(address: DeliveryAddressFields): Record<string, string> {
  return {
    name: address.name,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country,
    phone: address.phone,
  };
}

export function DeliveryAddressForm({
  address,
  onChange,
}: {
  address: DeliveryAddressFields;
  onChange: (next: DeliveryAddressFields) => void;
}) {
  const update = (key: keyof DeliveryAddressFields, value: string) => {
    onChange({ ...address, [key]: value });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="checkout-name">Full name</Label>
        <Input id="checkout-name" value={address.name} onChange={(e) => update("name", e.target.value)} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="checkout-line1">Address line 1</Label>
        <Input id="checkout-line1" value={address.line1} onChange={(e) => update("line1", e.target.value)} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="checkout-line2">Address line 2 (optional)</Label>
        <Input id="checkout-line2" value={address.line2} onChange={(e) => update("line2", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="checkout-city">City</Label>
        <Input id="checkout-city" value={address.city} onChange={(e) => update("city", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="checkout-state">State</Label>
        <Input id="checkout-state" value={address.state} onChange={(e) => update("state", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="checkout-postal">Postal code</Label>
        <Input id="checkout-postal" value={address.postal_code} onChange={(e) => update("postal_code", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="checkout-phone">Phone</Label>
        <Input id="checkout-phone" value={address.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>
    </div>
  );
}
