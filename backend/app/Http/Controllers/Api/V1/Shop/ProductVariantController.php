<?php

namespace App\Http\Controllers\Api\V1\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Product;
use App\Models\Shop\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    public function index(Product $product): JsonResponse
    {
        return response()->json([
            'data' => $product->variants()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'sku' => 'required|string|max:100|unique:shop_product_variants,sku',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'options' => 'nullable|array',
        ]);

        $variant = $product->variants()->create($validated);

        return response()->json(['data' => $variant], 201);
    }

    public function update(Request $request, Product $product, ProductVariant $variant): JsonResponse
    {
        abort_unless($variant->product_id === $product->id, 404);

        $validated = $request->validate([
            'sku' => 'sometimes|string|max:100|unique:shop_product_variants,sku,'.$variant->id,
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'options' => 'nullable|array',
        ]);

        $variant->update($validated);

        return response()->json(['data' => $variant->fresh()]);
    }

    public function destroy(Product $product, ProductVariant $variant): JsonResponse
    {
        abort_unless($variant->product_id === $product->id, 404);
        $variant->delete();

        return response()->json(['message' => 'Variant deleted.']);
    }
}
