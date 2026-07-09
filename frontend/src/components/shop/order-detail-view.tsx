"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatOfferingPrice } from "@/lib/offerings";
import { completeCheckoutPayment } from "@/lib/payments";
import type { ShopOrder } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

function orderTotal(order: ShopOrder): number {
  return Number(order.total ?? order.total_amount ?? 0);
}

function formatAddress(address: Record<string, string> | null | undefined): string[] {
  if (!address) return [];
  const lines: string[] = [];
  if (address.name) lines.push(address.name);
  const street = [address.line1, address.line2].filter(Boolean).join(", ");
  if (street) lines.push(street);
  const cityLine = [address.city, address.state, address.postal_code].filter(Boolean).join(", ");
  if (cityLine) lines.push(cityLine);
  if (address.phone) lines.push(address.phone);
  return lines;
}

export function OrderDetailView({ order, onRefresh }: { order: ShopOrder; onRefresh: () => void }) {
  const { token, user } = useAuthStore();
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const subtotal = Number(order.subtotal ?? orderTotal(order));
  const discount = Number(order.discount ?? 0);
  const shipping = Number(order.shipping ?? 0);
  const total = orderTotal(order);
  const addressLines = formatAddress(order.shipping_address ?? undefined);
  const unpaid = order.payment_status === "unpaid" || !order.payment_status;

  const payNow = async () => {
    if (!token || !user) return;
    setPaying(true);
    setMessage(null);
    try {
      const result = await completeCheckoutPayment({
        token,
        payableType: "shop_order",
        payableId: order.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone ?? undefined,
      });
      if (result.paid) {
        setMessage("Payment successful.");
        onRefresh();
      } else if (result.method === "payment_link") {
        setMessage("Complete payment in the opened tab, then refresh this page.");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-app-border bg-app-surface/80 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">Order</p>
          <p className="mt-1 font-mono text-lg font-semibold text-app-text">{order.order_number}</p>
          <p className="mt-2 text-sm text-app-muted">Placed {order.created_at?.slice(0, 10) ?? "—"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          {order.payment_status ? <StatusBadge status={order.payment_status} /> : null}
        </div>
      </div>

      {order.tracking_number ? (
        <div className="rounded-2xl border border-app-border bg-app-surface/80 p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-app-text">
            <Package className="h-4 w-4" />
            Tracking
          </p>
          <p className="mt-2 font-mono text-sm text-app-text">{order.tracking_number}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-app-border bg-app-surface/80 p-6">
        <h2 className="font-display text-lg font-semibold text-app-text">Items</h2>
        <ul className="mt-4 divide-y divide-app-border">
          {(order.items ?? []).map((item, index) => (
            <li key={item.id ?? index} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium text-app-text">{item.product_name}</p>
                <p className="mt-1 text-sm text-app-muted">Qty {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-medium text-app-text">
                {formatOfferingPrice(item.total, { prefix: false })}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {addressLines.length > 0 ? (
          <div className="rounded-2xl border border-app-border bg-app-surface/80 p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-app-text">
              <MapPin className="h-4 w-4" />
              Delivery address
            </p>
            <p className="mt-3 text-sm leading-relaxed text-app-muted">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold text-app-text">Order total</h2>
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
        </div>
      </div>

      {unpaid ? (
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={payNow} disabled={paying}>
            {paying ? "Opening payment…" : "Pay now"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/orders">Back to orders</Link>
          </Button>
        </div>
      ) : (
        <Button asChild variant="outline">
          <Link href="/account/orders">Back to orders</Link>
        </Button>
      )}

      {message ? <p className="text-sm text-app-muted">{message}</p> : null}
    </div>
  );
}
