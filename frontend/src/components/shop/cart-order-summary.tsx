"use client";

import Link from "next/link";
import { MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatOfferingPrice } from "@/lib/offerings";
import type { User } from "@/lib/api";
import { cn } from "@/lib/utils";

export function CartOrderSummary({
  subtotal,
  discount,
  total,
  couponCode,
  onCouponChange,
  onApplyCoupon,
  checkingOut,
  onCheckout,
  user,
  message,
}: {
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
  checkingOut: boolean;
  onCheckout: () => void;
  user: User;
  message: string | null;
}) {
  const addressComplete = Boolean(user.address_line1 && user.city && user.postal_code);

  return (
    <div className="rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border lg:sticky lg:top-24">
      <h2 className="font-display text-lg font-semibold text-app-text">Order summary</h2>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-app-muted">Subtotal</dt>
          <dd className="font-medium text-app-text">{formatOfferingPrice(subtotal, { prefix: false })}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between gap-4 text-status-success">
            <dt>Discount</dt>
            <dd>−{formatOfferingPrice(discount, { prefix: false })}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-app-border pt-3 text-base">
          <dt className="font-medium text-app-text">Total</dt>
          <dd className="font-semibold text-app-text">{formatOfferingPrice(total, { prefix: false })}</dd>
        </div>
      </dl>

      <div className="mt-6 space-y-2">
        <Label htmlFor="cart-coupon" className="flex items-center gap-2 text-app-muted">
          <Tag className="h-3.5 w-3.5" />
          Coupon code
        </Label>
        <div className="flex gap-2">
          <Input
            id="cart-coupon"
            value={couponCode}
            onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
            placeholder="SAVE10"
          />
          <Button type="button" variant="outline" onClick={onApplyCoupon}>
            Apply
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-app-border bg-app-surface-muted/40 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-app-muted">
          <MapPin className="h-3.5 w-3.5" />
          Ship to
        </p>
        {addressComplete ? (
          <p className="mt-2 text-sm leading-relaxed text-app-text">
            {user.name}
            <br />
            {user.address_line1}
            {user.address_line2 ? `, ${user.address_line2}` : ""}
            <br />
            {user.city}, {user.state ? `${user.state} ` : ""}
            {user.postal_code}
          </p>
        ) : (
          <p className="mt-2 text-sm text-status-warning">
            Add a delivery address before checkout.{" "}
            <Link href="/account/profile" className="font-medium text-accent-soft hover:text-accent">
              Update profile
            </Link>
          </p>
        )}
        {addressComplete && (
          <Link href="/account/profile" className="mt-2 inline-block text-xs font-medium text-accent-soft hover:text-accent">
            Change address
          </Link>
        )}
      </div>

      <Button type="button" className="mt-6 w-full" onClick={onCheckout} disabled={checkingOut || !addressComplete}>
        {checkingOut ? "Placing order…" : "Place order"}
      </Button>

      {message && (
        <p
          className={cn(
            "mt-4 text-sm",
            message.includes("success") ? "text-status-success" : "text-status-error",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
