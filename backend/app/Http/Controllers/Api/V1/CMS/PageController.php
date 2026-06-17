<?php

namespace App\Http\Controllers\Api\V1\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
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
            'slug' => Str::slug($validated['title']).'-'.Str::random(4),
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
}
