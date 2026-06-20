"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { CustomerAuthGuard } from "@/components/auth/customer-auth-guard";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, type Cart } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { revalidateShopPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";

function CartContent() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await apiClient.getCart(token);
      setCart(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const removeItem = async (itemId: number) => {
    if (!token) return;
    await apiClient.removeCartItem(token, itemId);
    await load();
  };

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => {
    const unit = Number(item.variant?.price ?? item.product?.price ?? 0);
    return sum + unit * item.quantity;
  }, 0);
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim() || subtotal <= 0) return;
    setMessage(null);
    try {
      const response = await apiClient.validateCoupon({ code: couponCode.trim(), subtotal });
      setDiscount(response.data.discount);
    } catch (e) {
      setDiscount(0);
      setMessage(e instanceof Error ? e.message : "Invalid coupon.");
    }
  };

  const checkout = async () => {
    if (!token || !user) return;
    if (!user.address_line1 || !user.city || !user.postal_code) {
      setMessage("Add your delivery address on your account page before checkout.");
      return;
    }
    setCheckingOut(true);
    setMessage(null);
    try {
      const shipping_address = {
        name: user.name,
        line1: user.address_line1,
        line2: user.address_line2 ?? "",
        city: user.city,
        state: user.state ?? "",
        postal_code: user.postal_code,
        country: user.country ?? "IN",
        phone: user.phone ?? "",
      };
      const response = await apiClient.createOrder(token, {
        shipping_address,
        coupon_code: couponCode.trim() || undefined,
      });
      await revalidateShopPublicCache();

      try {
        await openRazorpayCheckout({
          token,
          payableType: "shop_order",
          payableId: response.data.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone ?? undefined,
        });
      } catch {
        // Payment optional when Razorpay is not configured
      }

      router.push(`/confirmation?type=order&ref=${encodeURIComponent(response.data.order_number)}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Checkout failed.");
      setCheckingOut(false);
    }
  };

  return (
    <PageContainer className="py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-app-text md:text-4xl">Your cart</h1>
        <p className="mt-2 text-app-muted">Review items before placing your order.</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-app-muted">Loading cart…</p>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-app-border px-6 py-10 text-center">
                <p className="text-app-muted">Your cart is empty.</p>
                <Button asChild className="mt-4">
                  <Link href="/shop/products">Browse products</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const name = item.product?.name ?? "Product";
                const unitPrice = item.variant?.price ?? item.product?.price ?? "0";
                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-app-border bg-app-surface/80 p-4"
                  >
                    <div>
                      <p className="font-medium text-app-text">{name}</p>
                      {item.variant?.name && <p className="text-sm text-app-muted">{item.variant.name}</p>}
                      <p className="mt-1 text-sm text-app-muted">
                        Qty {item.quantity} · {formatOfferingPrice(unitPrice, { prefix: false })}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-status-error" />
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {items.length > 0 && (
          <>
            <Card className="mt-6">
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label>Coupon code</Label>
                  <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="SAVE10" />
                </div>
                <Button type="button" variant="outline" onClick={applyCoupon}>
                  Apply coupon
                </Button>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-app-text">
                  Total {formatOfferingPrice(total, { prefix: false })}
                </p>
                {discount > 0 && (
                  <p className="text-sm text-status-success">
                    Coupon applied (−{formatOfferingPrice(discount, { prefix: false })})
                  </p>
                )}
              </div>
              <Button type="button" onClick={checkout} disabled={checkingOut}>
                {checkingOut ? "Placing order…" : "Place order"}
              </Button>
            </div>
          </>
        )}

        {message && (
          <p className={`mt-4 text-sm ${message.includes("success") ? "text-status-success" : "text-status-error"}`}>
            {message}
            {message.includes("address") && (
              <>
                {" "}
                <Link href="/account" className="font-medium text-accent-soft hover:text-accent">
                  Update account
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </PageContainer>
  );
}

export default function ShopCartPage() {
  return (
    <CustomerAuthGuard>
      <CartContent />
    </CustomerAuthGuard>
  );
}
