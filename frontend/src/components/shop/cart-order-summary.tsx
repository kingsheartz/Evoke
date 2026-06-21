"use client";

import Link from "next/link";
import { MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatOfferingPrice } from "@/lib/offerings";
import type { User } from "@/lib/api";
import type { DeliveryAddressFields } from "@/components/shop/delivery-address-form";
import { cn } from "@/lib/utils";

export function CartOrderSummary({
  subtotal,
  discount,
  shipping = 0,
  total,
  couponCode,
  onCouponChange,
  onApplyCoupon,
  checkingOut,
  onCheckout,
  user,
  message,
  mode = "cart",
  address,
}: {
  subtotal: number;
  discount: number;
  shipping?: number;
  total: number;
  couponCode: string;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
  checkingOut: boolean;
  onCheckout: () => void;
  user?: User;
  message: string | null;
  mode?: "cart" | "checkout" | "readonly";
  address?: DeliveryAddressFields;
}) {
  const addressComplete = address
    ? Boolean(address.line1 && address.city && address.postal_code)
    : Boolean(user?.address_line1 && user?.city && user?.postal_code);

  const ctaLabel =
    mode === "cart" ? "Proceed to checkout" : checkingOut ? "Placing order…" : "Place order";

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
        {shipping > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-app-muted">Shipping</dt>
            <dd className="font-medium text-app-text">{formatOfferingPrice(shipping, { prefix: false })}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-app-border pt-3 text-base">
          <dt className="font-medium text-app-text">Total</dt>
          <dd className="font-semibold text-app-text">{formatOfferingPrice(total, { prefix: false })}</dd>
        </div>
      </dl>

      {mode !== "readonly" ? (
        <div className="mt-6 space-y-2">
          <Label htmlFor="cart-coupon" className="flex items-center gap-2 text-app-muted">
            <Tag className="h-3.5 w-3.5" />
            Coupon code
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="cart-coupon"
              value={couponCode}
              onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
              placeholder="SAVE10"
              className="min-w-0 flex-1"
            />
            <Button type="button" variant="outline" className="w-full shrink-0 sm:w-auto" onClick={onApplyCoupon}>
              Apply
            </Button>
          </div>
        </div>
      ) : null}

      {(mode === "cart" || mode === "checkout" || address) && (
        <div className="mt-6 rounded-xl border border-app-border bg-app-surface-muted/40 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-app-muted">
            <MapPin className="h-3.5 w-3.5" />
            Ship to
          </p>
          {addressComplete ? (
            <p className="mt-2 text-sm leading-relaxed text-app-text">
              {address?.name ?? user?.name}
              <br />
              {address?.line1 ?? user?.address_line1}
              {(address?.line2 ?? user?.address_line2) ? `, ${address?.line2 ?? user?.address_line2}` : ""}
              <br />
              {address?.city ?? user?.city}, {address?.state ?? user?.state ? `${address?.state ?? user?.state} ` : ""}
              {address?.postal_code ?? user?.postal_code}
            </p>
          ) : (
            <p className="mt-2 text-sm text-status-warning">
              {mode === "cart" ? "Add a delivery address during checkout." : "Complete your delivery address to continue."}
            </p>
          )}
          {mode === "cart" && !addressComplete && user && (
            <Link href="/account/profile" className="mt-2 inline-block text-xs font-medium text-accent-soft hover:text-accent">
              Update profile
            </Link>
          )}
        </div>
      )}

      {mode !== "readonly" ? (
        <Button
          type="button"
          className="mt-6 hidden w-full lg:inline-flex"
          onClick={onCheckout}
          disabled={checkingOut || (mode === "checkout" && !addressComplete)}
        >
          {ctaLabel}
        </Button>
      ) : null}

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
