<?php

namespace App\Http\Controllers\Api\V1\Academy;

use App\Http\Controllers\Controller;
use App\Models\Academy\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()->orderBy('sort_order')->orderBy('name')->get();

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $slug = $this->uniqueSlug(Str::slug($validated['name']));

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? ((int) Category::max('sort_order')) + 1,
            'is_active' => true,
        ]);

        return response()->json(['data' => $category], 201);
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base ?: 'category';
        $original = $slug;
        $i = 1;

        while (Category::where('slug', $slug)->exists()) {
            $slug = $original.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
