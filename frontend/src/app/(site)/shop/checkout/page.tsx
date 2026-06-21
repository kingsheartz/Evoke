"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CustomerAuthGuard } from "@/components/auth/customer-auth-guard";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { AccountNav } from "@/components/account/account-nav";
import { PageContainer } from "@/components/layout/app-shell";
import { CartLineItem } from "@/components/shop/cart-line-item";
import { CartOrderSummary } from "@/components/shop/cart-order-summary";
import { CheckoutSteps } from "@/components/shop/checkout-steps";
import {
  DeliveryAddressForm,
  deliveryAddressFromUser,
  deliveryAddressToPayload,
  isDeliveryAddressComplete,
  type DeliveryAddressFields,
} from "@/components/shop/delivery-address-form";
import { MobileCheckoutBar } from "@/components/shop/mobile-checkout-bar";
import { Button } from "@/components/ui/button";
import { apiClient, type Cart } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { revalidateShopPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

const COUPON_STORAGE_KEY = "evoke_cart_coupon";

function CheckoutContent() {
  const router = useRouter();
  const { token, user, setAuth } = useAuthStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState<DeliveryAddressFields | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

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
    if (!user) return;
    setAddress(deliveryAddressFromUser(user));
    load();
    const saved = sessionStorage.getItem(COUPON_STORAGE_KEY);
    if (saved) setCouponCode(saved);
  }, [token, user]);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => {
    const unit = Number(item.variant?.price ?? item.product?.price ?? 0);
    return sum + unit * item.quantity;
  }, 0);
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    if (!loading && items.length === 0) {
      router.replace("/shop/cart");
    }
  }, [loading, items.length, router]);

  const applyCoupon = async () => {
    if (!couponCode.trim() || subtotal <= 0) return;
    setMessage(null);
    try {
      const response = await apiClient.validateCoupon({ code: couponCode.trim(), subtotal });
      setDiscount(response.data.discount);
      sessionStorage.setItem(COUPON_STORAGE_KEY, couponCode.trim());
    } catch (e) {
      setDiscount(0);
      setMessage(e instanceof Error ? e.message : "Invalid coupon.");
    }
  };

  const saveAddressAndContinue = async () => {
    if (!token || !user || !address || !isDeliveryAddressComplete(address)) return;
    setSavingAddress(true);
    setMessage(null);
    try {
      const { data } = await apiClient.updateProfile(token, {
        name: address.name,
        phone: address.phone || undefined,
        address_line1: address.line1,
        address_line2: address.line2 || undefined,
        city: address.city,
        state: address.state || undefined,
        postal_code: address.postal_code,
        country: address.country || undefined,
      });
      setAuth(data, token);
      setStep(2);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const placeOrder = async () => {
    if (!token || !user || !address || !isDeliveryAddressComplete(address)) return;
    setCheckingOut(true);
    setMessage(null);
    try {
      const shipping_address = deliveryAddressToPayload(address);
      const response = await apiClient.createOrder(token, {
        shipping_address,
        coupon_code: couponCode.trim() || undefined,
      });
      await revalidateShopPublicCache();
      sessionStorage.removeItem(COUPON_STORAGE_KEY);
      setStep(3);

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
        /* Payment optional when Razorpay is not configured */
      }

      router.push(
        `/confirmation?type=order&ref=${encodeURIComponent(response.data.order_number)}&id=${response.data.id}`,
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Checkout failed.");
      setCheckingOut(false);
    }
  };

  if (!user || !token || !address) return null;

  return (
    <PageContainer className="py-8 md:py-12 lg:py-16">
      <AccountMobileHeader />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <aside className="hidden lg:block lg:w-56 lg:shrink-0">
          <div className="rounded-2xl border border-app-border bg-app-surface/60 p-4 lg:sticky lg:top-24">
            <AccountNav />
          </div>
        </aside>

        <div className={cn("min-w-0 flex-1", step === 2 && items.length > 0 && "pb-24 lg:pb-0")}>
          <Link
            href="/shop/cart"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-app-muted hover:text-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl md:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-app-muted">Review delivery details and confirm your order.</p>

          <div className="mt-8">
            <CheckoutSteps current={step} />
          </div>

          {loading ? (
            <p className="mt-8 text-sm text-app-muted">Loading checkout…</p>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div>
                {step === 1 && (
                  <div className="rounded-2xl border border-app-border bg-app-surface/80 p-6">
                    <h2 className="font-display text-lg font-semibold text-app-text">Delivery address</h2>
                    <p className="mt-1 text-sm text-app-muted">Where should we ship your order?</p>
                    <div className="mt-6">
                      <DeliveryAddressForm address={address} onChange={setAddress} />
                    </div>
                    <Button
                      type="button"
                      className="mt-6"
                      onClick={saveAddressAndContinue}
                      disabled={savingAddress || !isDeliveryAddressComplete(address)}
                    >
                      {savingAddress ? "Saving…" : "Continue to review"}
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-app-border bg-app-surface/80 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display text-lg font-semibold text-app-text">Review items</h2>
                          <p className="mt-1 text-sm text-app-muted">{items.length} item{items.length === 1 ? "" : "s"}</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)}>
                          Edit address
                        </Button>
                      </div>
                      <div className="mt-6 space-y-3">
                        {items.map((item) => {
                          const product = item.product;
                          const unitPrice = item.variant?.price ?? product?.price ?? "0";
                          return (
                            <CartLineItem
                              key={item.id}
                              name={product?.name ?? "Product"}
                              variantName={item.variant?.name}
                              quantity={item.quantity}
                              unitPrice={unitPrice}
                              slug={product?.slug}
                              image={product?.images?.[0]}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {step >= 2 && (
                <CartOrderSummary
                  mode="checkout"
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                  couponCode={couponCode}
                  onCouponChange={setCouponCode}
                  onApplyCoupon={applyCoupon}
                  checkingOut={checkingOut}
                  onCheckout={placeOrder}
                  address={address}
                  message={message}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {step === 2 && items.length > 0 && (
        <MobileCheckoutBar
          total={total}
          checkingOut={checkingOut}
          disabled={!isDeliveryAddressComplete(address)}
          onCheckout={placeOrder}
        />
      )}
    </PageContainer>
  );
}

export default function ShopCheckoutPage() {
  return (
    <CustomerAuthGuard>
      <CheckoutContent />
    </CustomerAuthGuard>
  );
}
