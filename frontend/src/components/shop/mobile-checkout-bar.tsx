"use client";

import { Button } from "@/components/ui/button";
import { formatOfferingPrice } from "@/lib/offerings";

export function MobileCheckoutBar({
  total,
  checkingOut,
  disabled,
  onCheckout,
  label = "Place order",
}: {
  total: number;
  checkingOut: boolean;
  disabled?: boolean;
  onCheckout: () => void;
  label?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-app-border bg-app-bg/95 px-4 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-app-muted">Order total</p>
          <p className="text-lg font-semibold tabular-nums text-app-text">
            {formatOfferingPrice(total, { prefix: false })}
          </p>
        </div>
        <Button
          type="button"
          className="h-11 shrink-0 px-6"
          onClick={onCheckout}
          disabled={checkingOut || disabled}
        >
          {checkingOut ? "Please wait…" : label}
        </Button>
      </div>
    </div>
  );
}
