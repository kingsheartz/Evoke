<?php

namespace App\Http\Controllers\Api\V1\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\PageSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PageSectionController extends Controller
{
    public function store(Request $request, int $pageId): JsonResponse
    {
        $validated = $request->validate([
            'component_type' => 'required|string|in:hero,banner,buttons,tabs,table,text,gallery,faq,video,cards,testimonials,map,forms,stats,itinerary,inclusions,catalog',
            'content' => 'required|array',
            'section_key' => 'nullable|string',
            'is_visible' => 'boolean',
        ]);

        $maxOrder = PageSection::where('page_id', $pageId)->max('sort_order') ?? 0;

        $section = PageSection::create([
            ...$validated,
            'page_id' => $pageId,
            'sort_order' => $maxOrder + 1,
            'is_visible' => $validated['is_visible'] ?? true,
        ]);

        return response()->json(['data' => $section], 201);
    }

    public function update(Request $request, int $pageId, PageSection $section): JsonResponse
    {
        abort_unless($section->page_id === $pageId, 404);

        $validated = $request->validate([
            'component_type' => 'sometimes|string|in:hero,banner,buttons,tabs,table,text,gallery,faq,video,cards,testimonials,map,forms,stats,itinerary,inclusions,catalog',
            'content' => 'sometimes|array',
            'is_visible' => 'boolean',
        ]);

        $section->update($validated);

        return response()->json(['data' => $section->fresh()]);
    }

    public function destroy(int $pageId, PageSection $section): JsonResponse
    {
        abort_unless($section->page_id === $pageId, 404);
        $section->delete();

        return response()->json(['message' => 'Section deleted.']);
    }

    public function duplicate(int $pageId, PageSection $section): JsonResponse
    {
        abort_unless($section->page_id === $pageId, 404);

        $insertOrder = $section->sort_order + 1;

        $copy = DB::transaction(function () use ($pageId, $section, $insertOrder) {
            PageSection::where('page_id', $pageId)
                ->where('sort_order', '>=', $insertOrder)
                ->increment('sort_order');

            return PageSection::create([
                'page_id' => $pageId,
                'section_key' => $section->section_key,
                'component_type' => $section->component_type,
                'content' => $section->content,
                'sort_order' => $insertOrder,
                'is_visible' => $section->is_visible,
            ]);
        });

        return response()->json(['data' => $copy], 201);
    }

    public function reorder(Request $request, int $pageId): JsonResponse
    {
        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|integer|exists:cms_page_sections,id',
            'sections.*.sort_order' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated, $pageId) {
            foreach ($validated['sections'] as $item) {
                PageSection::where('id', $item['id'])
                    ->where('page_id', $pageId)
                    ->update(['sort_order' => $item['sort_order']]);
            }
        });

        $sections = PageSection::where('page_id', $pageId)->orderBy('sort_order')->get();

        return response()->json(['data' => $sections]);
    }
}
