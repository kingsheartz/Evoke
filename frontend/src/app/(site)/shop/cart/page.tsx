"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { CustomerAuthGuard } from "@/components/auth/customer-auth-guard";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { AccountNav } from "@/components/account/account-nav";
import { PageContainer } from "@/components/layout/app-shell";
import { CartOrderSummary } from "@/components/shop/cart-order-summary";
import { MobileCheckoutBar } from "@/components/shop/mobile-checkout-bar";
import { Button } from "@/components/ui/button";
import { apiClient, type Cart } from "@/lib/api";
import { formatOfferingPrice } from "@/lib/offerings";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { revalidateShopPublicCache } from "@/lib/revalidate-cms";
import { useAuthStore } from "@/stores/app";
import { cn } from "@/lib/utils";

function CartLineItem({
  name,
  variantName,
  quantity,
  unitPrice,
  slug,
  image,
  onRemove,
}: {
  name: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: string;
  slug?: string;
  image?: string | null;
  onRemove: () => void;
}) {
  const lineTotal = Number(unitPrice) * quantity;

  return (
    <div className="flex gap-3 rounded-xl border border-app-border bg-app-surface/80 p-3 sm:gap-4 sm:p-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-app-surface-muted ring-1 ring-app-border sm:h-20 sm:w-20">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <ShoppingBag className="h-7 w-7 text-app-muted" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {slug ? (
          <Link href={`/shop/${slug}`} className="font-medium text-app-text hover:text-accent-soft">
            {name}
          </Link>
        ) : (
          <p className="font-medium text-app-text">{name}</p>
        )}
        {variantName && <p className="text-sm text-app-muted">{variantName}</p>}
        <p className="mt-2 text-sm text-app-muted">
          Qty {quantity} × {formatOfferingPrice(unitPrice, { prefix: false })}
        </p>
        <p className="mt-1 text-sm font-medium text-app-text">
          {formatOfferingPrice(lineTotal, { prefix: false })}
        </p>
      </div>
      <Button type="button" variant="ghost" size="sm" className="shrink-0 self-start" onClick={onRemove} aria-label={`Remove ${name}`}>
        <Trash2 className="h-4 w-4 text-status-error" />
      </Button>
    </div>
  );
}

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
      setMessage("Add your delivery address before checkout.");
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
        /* Payment optional when Razorpay is not configured */
      }

      router.push(`/confirmation?type=order&ref=${encodeURIComponent(response.data.order_number)}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Checkout failed.");
      setCheckingOut(false);
    }
  };

  if (!user || !token) return null;

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
            {items.length === 0 ? "Your cart is empty." : `${items.length} item${items.length === 1 ? "" : "s"} ready for checkout.`}
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
                subtotal={subtotal}
                discount={discount}
                total={total}
                couponCode={couponCode}
                onCouponChange={setCouponCode}
                onApplyCoupon={applyCoupon}
                checkingOut={checkingOut}
                onCheckout={checkout}
                user={user}
                message={message}
              />
            )}
          </div>

          {items.length === 0 && message && <p className="mt-4 text-sm text-status-error">{message}</p>}
        </div>
      </div>

      {items.length > 0 && (
        <MobileCheckoutBar
          total={total}
          checkingOut={checkingOut}
          disabled={!user.address_line1 || !user.city || !user.postal_code}
          onCheckout={checkout}
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
