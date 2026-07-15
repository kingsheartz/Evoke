<?php

namespace App\Http\Controllers\Api\V1\Academy;

use App\Http\Controllers\Controller;
use App\Models\Academy\Category;
use App\Models\Academy\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = Category::where('is_active', true)->orderBy('sort_order')->get();

        return response()->json(['data' => $categories]);
    }

    public function index(Request $request): JsonResponse
    {
        $sort = $request->input('sort', 'newest');
        $search = $request->input('q', $request->input('search'));

        $courses = Course::query()
            ->where('status', 'published')
            ->with(['category', 'batches.trainer'])
            ->when($request->category, fn ($q, $cat) => $q->whereHas('category', fn ($c) => $c->where('slug', $cat)))
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->when(filled($search), function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->whereLikeInsensitive('title', "%{$search}%")
                        ->orWhereLikeInsensitive('description', "%{$search}%");
                });
            })
            ->when($request->filled('min_price'), fn ($q) => $q->where('fees', '>=', $request->input('min_price')))
            ->when($request->filled('max_price'), fn ($q) => $q->where('fees', '<=', $request->input('max_price')));

        match ($sort) {
            'price_asc' => $courses->orderBy('fees')->orderBy('title'),
            'price_desc' => $courses->orderByDesc('fees')->orderBy('title'),
            'name_asc' => $courses->orderBy('title'),
            'name_desc' => $courses->orderByDesc('title'),
            'featured' => $courses->orderByDesc('is_featured')->orderByDesc('created_at'),
            default => $courses->latest(),
        };

        return response()->json($courses->paginate($request->integer('per_page', 24)));
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $courses = Course::query()
            ->with(['category', 'batches'])
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->search, fn ($q, $search) => $q->whereLikeInsensitive('title', "%{$search}%"))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($courses);
    }

    public function adminShow(Course $course): JsonResponse
    {
        return response()->json(['data' => $course->load(['category', 'batches.trainer'])]);
    }

    public function show(string $slug): JsonResponse
    {
        $course = Course::where('slug', $slug)
            ->where('status', 'published')
            ->with(['category', 'batches.trainer', 'branch'])
            ->firstOrFail();

        return response()->json(['data' => $course]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:academy_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:5000',
            'duration' => 'nullable|string',
            'fees' => 'required|numeric|min:0',
            'thumbnail' => 'nullable|string',
            'gallery' => 'nullable|array',
            'requires_approval' => 'boolean',
        ]);

        $course = Course::create([
            ...$validated,
            'slug' => Str::slug($validated['title']).'-'.Str::random(4),
            'status' => 'draft',
        ]);

        return response()->json(['data' => $course], 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:academy_categories,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:5000',
            'duration' => 'nullable|string',
            'fees' => 'sometimes|numeric|min:0',
            'status' => 'nullable|string|in:draft,published,archived',
            'requires_approval' => 'boolean',
            'thumbnail' => 'nullable|string',
            'gallery' => 'nullable|array',
            'is_featured' => 'boolean',
            'related_slugs' => 'nullable|array',
            'related_slugs.*' => 'string|max:255',
        ]);

        $course->update($validated);

        return response()->json(['data' => $course->fresh('category')]);
    }
}
