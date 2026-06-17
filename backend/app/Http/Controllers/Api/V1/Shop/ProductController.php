<?php

namespace App\Http\Controllers\Api\V1\Shop;

use App\Application\Shop\Services\OrderService;
use App\Events\Shop\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Models\Shop\Category;
use App\Models\Shop\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json(['data' => Category::where('is_active', true)->orderBy('sort_order')->get()]);
    }

    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->where('is_active', true)
            ->with(['category', 'variants'])
            ->when($request->category, fn ($q, $cat) => $q->whereHas('category', fn ($c) => $c->where('slug', $cat)))
            ->when($request->featured, fn ($q) => $q->where('is_featured', true))
            ->paginate($request->integer('per_page', 15));

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->where('is_active', true)
            ->with(['category', 'variants'])->firstOrFail();

        return response()->json(['data' => $product]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:shop_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|unique:shop_products,sku',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'images' => 'nullable|array',
        ]);

        $product = Product::create([
            ...$validated,
            'slug' => Str::slug($validated['name']).'-'.Str::random(4),
        ]);

        return response()->json(['data' => $product], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $product->update($validated);

        return response()->json(['data' => $product->fresh('category')]);
    }
}
