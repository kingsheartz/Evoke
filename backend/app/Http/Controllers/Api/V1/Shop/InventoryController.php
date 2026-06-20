<?php

namespace App\Http\Controllers\Api\V1\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Product;
use App\Models\Shop\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function adminIndex(Request $request): JsonResponse
    {
        $threshold = $request->integer('low_stock_threshold', 5);

        $products = Product::query()
            ->with(['category'])
            ->when($request->boolean('low_stock_only', true), fn ($q) => $q->where('stock', '<=', $threshold))
            ->orderBy('stock')
            ->paginate($request->integer('per_page', 30));

        $variants = ProductVariant::query()
            ->with('product')
            ->when($request->boolean('low_stock_only', true), fn ($q) => $q->where('stock', '<=', $threshold))
            ->orderBy('stock')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => [
                'products' => $products,
                'low_stock_variants' => $variants,
                'threshold' => $threshold,
            ],
        ]);
    }

    public function adjustStock(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product->update(['stock' => $validated['stock']]);

        return response()->json(['data' => $product->fresh()]);
    }
}
