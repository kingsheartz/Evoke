<?php

namespace App\Http\Controllers\Api\V1\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function adminIndex(Request $request): JsonResponse
    {
        $pages = Page::query()
            ->with('sections')
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($pages);
    }

    public function adminShow(Page $page): JsonResponse
    {
        return response()->json(['data' => $page->load(['sections' => fn ($q) => $q->orderBy('sort_order')])]);
    }

    public function index(Request $request): JsonResponse
    {
        $pages = Page::query()
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->where('status', 'published')
            ->with('sections')
            ->latest('published_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($pages);
    }

    public function show(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)
            ->where('status', 'published')
            ->with(['sections' => fn ($q) => $q->where('is_visible', true)])
            ->firstOrFail();

        return response()->json(['data' => $page]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'nullable|string|in:page,blog,landing,promotion,event',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|array',
            'status' => 'nullable|string|in:draft,published',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
        ]);

        $page = Page::create([
            ...$validated,
            'slug' => $this->uniqueSlug($validated['title']),
            'author_id' => $request->user()->id,
            'published_at' => ($validated['status'] ?? 'draft') === 'published' ? now() : null,
        ]);

        return response()->json(['data' => $page], 201);
    }

    public function update(Request $request, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|array',
            'status' => 'nullable|string|in:draft,published',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'published' && ! $page->published_at) {
            $validated['published_at'] = now();
        }

        $page->update($validated);

        return response()->json(['data' => $page->fresh('sections')]);
    }

    public function destroy(Page $page): JsonResponse
    {
        $page->delete();

        return response()->json(['message' => 'Page deleted.']);
    }

    public function duplicate(Request $request, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $page->load(['sections' => fn ($q) => $q->orderBy('sort_order')]);

        $copy = DB::transaction(function () use ($request, $page, $validated) {
            $title = $validated['title'] ?? $page->title.' (Copy)';

            $duplicate = Page::create([
                'title' => $title,
                'slug' => $this->uniqueSlug($title),
                'type' => $page->type,
                'excerpt' => $page->excerpt,
                'content' => $page->content,
                'status' => 'draft',
                'seo_title' => $page->seo_title,
                'seo_description' => $page->seo_description,
                'featured_image' => $page->featured_image,
                'author_id' => $request->user()->id,
                'published_at' => null,
            ]);

            foreach ($page->sections as $index => $section) {
                $duplicate->sections()->create([
                    'section_key' => $section->section_key,
                    'component_type' => $section->component_type,
                    'content' => $section->content,
                    'sort_order' => $section->sort_order ?? $index,
                    'is_visible' => $section->is_visible,
                ]);
            }

            return $duplicate->load(['sections' => fn ($q) => $q->orderBy('sort_order')]);
        });

        return response()->json(['data' => $copy], 201);
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 1;

        while (Page::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
