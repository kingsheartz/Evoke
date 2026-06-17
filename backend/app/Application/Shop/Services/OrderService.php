<?php

namespace App\Application\Shop\Services;

use App\Models\Shop\Cart;
use App\Models\Shop\Coupon;
use App\Models\Shop\Order;
use App\Models\Shop\OrderItem;
use App\Models\User;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    public function createFromCart(User $user, array $shippingAddress, ?array $billingAddress, ?string $couponCode): Order
    {
        $cart = $this->cartService->getOrCreate($user)->load('items.product', 'items.variant');

        if ($cart->items->isEmpty()) {
            abort(422, 'Cart is empty.');
        }

        $subtotal = $cart->items->sum(fn ($item) => $item->unit_price * $item->quantity);
        $discount = 0;

        $coupon = null;
        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)->where('is_active', true)->first();
            if ($coupon) {
                $discount = $coupon->type === 'percentage'
                    ? $subtotal * ($coupon->value / 100)
                    : min($coupon->value, $subtotal);
            }
        }

        $total = $subtotal - $discount;

        $order = Order::create([
            'order_number' => 'EVK-'.strtoupper(Str::random(8)),
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => 0,
            'total' => $total,
            'coupon_id' => $coupon?->id,
            'shipping_address' => $shippingAddress,
            'billing_address' => $billingAddress ?? $shippingAddress,
        ]);

        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'product_name' => $item->product->name,
                'sku' => $item->variant?->sku ?? $item->product->sku,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total' => $item->unit_price * $item->quantity,
            ]);
        }

        $cart->items()->delete();

        return $order;
    }
}
