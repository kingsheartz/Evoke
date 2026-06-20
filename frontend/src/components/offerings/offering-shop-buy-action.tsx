"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ProductVariant } from "@/lib/api";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

export function ShopBuyAction({
  productId,
  stock,
  variants = [],
  redirectPath,
}: {
  productId: number;
  stock: number;
  variants?: ProductVariant[];
  redirectPath: string;
}) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [variantId, setVariantId] = useState<number | "">(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signInHref = `/sign-in?redirect=${encodeURIComponent(redirectPath)}`;
  const outOfStock = stock <= 0;

  const addToCart = async () => {
    if (outOfStock) return;
    if (!token) {
      router.push(signInHref);
      return;
    }
    if (variants.length > 0 && variantId === "") {
      setMessage("Choose a variant.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await apiClient.addCartItem(token, {
        product_id: productId,
        variant_id: variantId === "" ? null : variantId,
        quantity,
      });
      router.push("/shop/cart");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not add to cart.");
      setSubmitting(false);
    }
  };

  if (outOfStock) {
    return (
      <Button type="button" disabled className="h-12 rounded-xl px-6 text-sm font-semibold opacity-60">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:items-end">
      {variants.length > 0 && (
        <div className="w-full space-y-2">
          <Label>Variant</Label>
          <Select
            value={variantId === "" ? "" : String(variantId)}
            onChange={(e) => setVariantId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select variant</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} — ₹{variant.price}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="flex w-full flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label>Qty</Label>
          <Input
            type="number"
            min={1}
            className="w-24"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          />
        </div>
        <Button type="button" className="h-12 rounded-xl px-6 text-sm font-semibold" onClick={addToCart} disabled={submitting}>
          {submitting ? "Adding…" : "Add to cart"}
        </Button>
      </div>
      {!token && (
        <p className="text-xs text-app-muted">
          <Link href={signInHref} className="text-accent-soft hover:text-accent">
            Sign in
          </Link>{" "}
          to save items to your cart.
        </p>
      )}
      {message && <p className="text-sm text-status-error">{message}</p>}
    </div>
  );
}
