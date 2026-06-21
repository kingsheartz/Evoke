"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { CustomerAuthGuard } from "@/components/auth/customer-auth-guard";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { AccountNav } from "@/components/account/account-nav";
import { PageContainer } from "@/components/layout/app-shell";
import { CartLineItem } from "@/components/shop/cart-line-item";
import { CartOrderSummary } from "@/components/shop/cart-order-summary";
import { MobileCheckoutBar } from "@/components/shop/mobile-checkout-bar";
import { Button } from "@/components/ui/button";
import { apiClient, type Cart } from "@/lib/api";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

const COUPON_STORAGE_KEY = "evoke_cart_coupon";

function CartContent() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
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
    const saved = sessionStorage.getItem(COUPON_STORAGE_KEY);
    if (saved) setCouponCode(saved);
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
    try {
      const response = await apiClient.validateCoupon({ code: couponCode.trim(), subtotal });
      setDiscount(response.data.discount);
      sessionStorage.setItem(COUPON_STORAGE_KEY, couponCode.trim());
    } catch {
      setDiscount(0);
      sessionStorage.removeItem(COUPON_STORAGE_KEY);
    }
  };

  const proceedToCheckout = () => {
    if (couponCode.trim()) {
      sessionStorage.setItem(COUPON_STORAGE_KEY, couponCode.trim());
    }
    router.push("/shop/checkout");
  };

  if (!token) return null;

  return (
    <PageContainer className="py-8 md:py-12 lg:py-16">
      <AccountMobileHeader />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <aside className="hidden lg:block lg:w-56 lg:shrink-0">
          <div className="rounded-2xl border border-app-border bg-app-surface/60 p-4 lg:sticky lg:top-24">
            <AccountNav />
          </div>
        </aside>

        <div className={cn("min-w-0 flex-1", items.length > 0 && "pb-24 lg:pb-0")}>
          <Link
            href="/shop/products"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-app-muted hover:text-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl md:text-4xl">
            Your cart
          </h1>
          <p className="mt-2 text-app-muted">
            {items.length === 0 ? "Your cart is empty." : `${items.length} item${items.length === 1 ? "" : "s"} in your cart.`}
          </p>

          <div className={cn("mt-8 grid gap-8", items.length > 0 && "lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]")}>
            <div>
              {loading ? (
                <p className="text-sm text-app-muted">Loading cart…</p>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-app-border px-6 py-14 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-app-muted" />
                  <p className="mt-4 text-app-muted">Add products from the shop to get started.</p>
                  <Button asChild className="mt-6">
                    <Link href="/shop/products">Browse products</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
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
                        onRemove={() => removeItem(item.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <CartOrderSummary
                mode="cart"
                subtotal={subtotal}
                discount={discount}
                total={total}
                couponCode={couponCode}
                onCouponChange={setCouponCode}
                onApplyCoupon={applyCoupon}
                checkingOut={false}
                onCheckout={proceedToCheckout}
                user={user ?? undefined}
                message={null}
              />
            )}
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <MobileCheckoutBar
          total={total}
          checkingOut={false}
          onCheckout={proceedToCheckout}
          label="Checkout"
        />
      )}
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
