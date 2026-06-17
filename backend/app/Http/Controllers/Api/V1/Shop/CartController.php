<?php

namespace App\Http\Controllers\Api\V1\Shop;

use App\Application\Shop\Services\CartService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartService->getOrCreate($request->user());

        return response()->json(['data' => $cart->load('items.product', 'items.variant')]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:shop_products,id',
            'variant_id' => 'nullable|exists:shop_product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->cartService->addItem(
            $request->user(),
            $validated['product_id'],
            $validated['variant_id'] ?? null,
            $validated['quantity']
        );

        return response()->json(['data' => $cart->load('items.product')]);
    }

    public function removeItem(Request $request, int $item): JsonResponse
    {
        $cart = $this->cartService->removeItem($request->user(), $item);

        return response()->json(['data' => $cart->load('items.product')]);
    }
}
