<?php

namespace App\Http\Controllers\Api\V1\CMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DivisionPageController extends Controller
{
    /** URL segments reserved for other app routes — not valid division slugs. */
    private const RESERVED_SLUGS = [
        'account', 'admin', 'login', 'sign-in', 'register', 'p', 'api', 'health', 'search', 'modules', 'homepage',
        'tours', 'shop', 'academy',
    ];

    public function index(): JsonResponse
    {
        $pages = DB::table('division_page_settings')
            ->where('is_active', true)
            ->where('show_in_nav', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn ($page) => $this->format($page, navOnly: true));

        return response()->json(['data' => $pages]);
    }

    public function show(string $slug): JsonResponse
    {
        $this->assertValidSlug($slug);

        $page = DB::table('division_page_settings')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $page) {
            return response()->json(['data' => null], 404);
        }

        return response()->json(['data' => $this->format($page)]);
    }

    public function adminIndex(): JsonResponse
    {
        $pages = DB::table('division_page_settings')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn ($page) => $this->format($page));

        return response()->json(['data' => $pages]);
    }

    public function adminShow(string $slug): JsonResponse
    {
        $page = DB::table('division_page_settings')->where('slug', $slug)->first();

        abort_if(! $page, 404);

        return response()->json(['data' => $this->format($page)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => 'required|string|max:64|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/|unique:division_page_settings,slug',
            'nav_label' => 'required|string|max:255',
            'badge' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'icon' => 'nullable|string|max:64',
            'accent_style' => 'nullable|string|in:accent,emerald,orange,rose,blue,amber,violet',
            'home_gradient' => 'nullable|string|max:255',
            'show_in_nav' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'highlight_cards' => 'nullable|array',
            'footer_note' => 'nullable|string|max:500',
            'meta' => 'nullable|array',
        ]);

        $slug = $validated['slug'];
        $this->assertValidSlug($slug);

        $maxOrder = (int) DB::table('division_page_settings')->max('sort_order');

        DB::table('division_page_settings')->insert([
            'slug' => $slug,
            'nav_label' => $validated['nav_label'],
            'sort_order' => $validated['sort_order'] ?? ($maxOrder + 1),
            'show_in_nav' => $validated['show_in_nav'] ?? true,
            'badge' => $validated['badge'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'icon' => $validated['icon'] ?? 'graduation-cap',
            'accent_style' => $validated['accent_style'] ?? 'accent',
            'home_gradient' => $validated['home_gradient'] ?? null,
            'highlight_cards' => json_encode($validated['highlight_cards'] ?? []),
            'footer_note' => $validated['footer_note'] ?? null,
            'meta' => json_encode($validated['meta'] ?? ['sections' => []]),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $page = DB::table('division_page_settings')->where('slug', $slug)->first();

        return response()->json([
            'message' => 'Division created successfully.',
            'data' => $this->format($page),
        ], 201);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $page = DB::table('division_page_settings')->where('slug', $slug)->first();
        abort_if(! $page, 404);

        $validated = $request->validate([
            'nav_label' => 'sometimes|string|max:255',
            'badge' => 'sometimes|string|max:255',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:5000',
            'icon' => 'nullable|string|max:64',
            'accent_style' => 'nullable|string|in:accent,emerald,orange,rose,blue,amber,violet',
            'home_gradient' => 'nullable|string|max:255',
            'show_in_nav' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'highlight_cards' => 'nullable|array',
            'highlight_cards.*.title' => 'required_with:highlight_cards|string|max:255',
            'highlight_cards.*.description' => 'nullable|string|max:1000',
            'highlight_cards.*.icon' => 'nullable|string|max:64',
            'highlight_cards.*.link_url' => 'nullable|string|max:2048',
            'highlight_cards.*.link_label' => 'nullable|string|max:255',
            'footer_note' => 'nullable|string|max:500',
            'meta' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $payload = array_filter([
            'nav_label' => $validated['nav_label'] ?? null,
            'badge' => $validated['badge'] ?? null,
            'title' => $validated['title'] ?? null,
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'accent_style' => $validated['accent_style'] ?? null,
            'show_in_nav' => array_key_exists('show_in_nav', $validated) ? $validated['show_in_nav'] : null,
            'sort_order' => $validated['sort_order'] ?? null,
            'is_active' => array_key_exists('is_active', $validated) ? $validated['is_active'] : null,
            'updated_at' => now(),
        ], fn ($v) => $v !== null);

        if (array_key_exists('footer_note', $validated)) {
            $payload['footer_note'] = filled($validated['footer_note']) ? $validated['footer_note'] : null;
        }
        if (array_key_exists('home_gradient', $validated)) {
            $payload['home_gradient'] = filled($validated['home_gradient']) ? $validated['home_gradient'] : null;
        }

        if (array_key_exists('highlight_cards', $validated)) {
            $payload['highlight_cards'] = json_encode($validated['highlight_cards'] ?? []);
        }
        if (array_key_exists('meta', $validated)) {
            $payload['meta'] = json_encode($validated['meta'] ?? []);
        }

        DB::table('division_page_settings')->where('id', $page->id)->update($payload);

        $fresh = DB::table('division_page_settings')->where('id', $page->id)->first();

        return response()->json([
            'message' => 'Division page updated successfully.',
            'data' => $this->format($fresh),
        ]);
    }

    public function destroy(string $slug): JsonResponse
    {
        $page = DB::table('division_page_settings')->where('slug', $slug)->first();
        abort_if(! $page, 404);

        DB::table('division_page_settings')->where('id', $page->id)->delete();

        return response()->json(['message' => 'Division deleted.']);
    }

    private function assertValidSlug(string $slug): void
    {
        abort_if(in_array($slug, self::RESERVED_SLUGS, true), 422, 'This URL slug is reserved.');
    }

    private function format(object $page, bool $navOnly = false): array
    {
        $data = [
            'slug' => $page->slug,
            'nav_label' => $page->nav_label ?? $page->badge,
            'sort_order' => (int) ($page->sort_order ?? 0),
            'show_in_nav' => (bool) ($page->show_in_nav ?? true),
            'public_path' => '/'.$page->slug,
        ];

        if ($navOnly) {
            $data['icon'] = $page->icon;

            return $data;
        }

        return [
            ...$data,
            'badge' => $page->badge,
            'title' => $page->title,
            'description' => $page->description,
            'icon' => $page->icon,
            'accent_style' => $page->accent_style ?? 'accent',
            'home_gradient' => $page->home_gradient,
            'highlight_cards' => json_decode($page->highlight_cards ?? '[]', true),
            'footer_note' => filled($page->footer_note ?? null) ? $page->footer_note : null,
            'meta' => json_decode($page->meta ?? '{}', true),
            'is_active' => (bool) ($page->is_active ?? true),
        ];
    }
}
