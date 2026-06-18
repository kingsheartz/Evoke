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
        $courses = Course::query()
            ->where('status', 'published')
            ->with(['category', 'batches.trainer'])
            ->when($request->category, fn ($q, $cat) => $q->whereHas('category', fn ($c) => $c->where('slug', $cat)))
            ->paginate($request->integer('per_page', 15));

        return response()->json($courses);
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
            'duration' => 'nullable|string',
            'fees' => 'sometimes|numeric|min:0',
            'status' => 'nullable|string|in:draft,published,archived',
            'gallery' => 'nullable|array',
        ]);

        $course->update($validated);

        return response()->json(['data' => $course->fresh('category')]);
    }
}
