<?php

namespace App\Application\Shop\Services;

use App\Models\Shop\Product;
use App\Models\Shop\ProductVariant;
use App\Models\Shop\Cart;
use App\Models\Shop\CartItem;
use App\Models\User;

class CartService
{
    public function getOrCreate(User $user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }

    public function addItem(User $user, int $productId, ?int $variantId, int $quantity): Cart
    {
        $cart = $this->getOrCreate($user);
        $product = Product::findOrFail($productId);
        $price = $product->price;

        if ($variantId) {
            $variant = ProductVariant::where('product_id', $productId)->findOrFail($variantId);
            $price = $variant->price;
        }

        $item = CartItem::firstOrNew([
            'cart_id' => $cart->id,
            'product_id' => $productId,
            'variant_id' => $variantId,
        ]);

        $item->quantity = ($item->exists ? $item->quantity : 0) + $quantity;
        $item->unit_price = $price;
        $item->save();

        return $cart->fresh();
    }

    public function removeItem(User $user, int $itemId): Cart
    {
        $cart = $this->getOrCreate($user);
        CartItem::where('cart_id', $cart->id)->where('id', $itemId)->delete();

        return $cart->fresh();
    }
}
