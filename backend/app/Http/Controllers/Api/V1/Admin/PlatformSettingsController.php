<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlatformSettingsController extends Controller
{
    public function show(Request $request, string $key): JsonResponse
    {
        $this->authorizeSettingsKey($request, $key);

        $row = DB::table('platform_settings')->where('key', $key)->first();

        return response()->json([
            'data' => $row ? json_decode($row->value, true) : null,
        ]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        abort_unless(in_array($key, ['admin_preferences', 'advertisements', 'brand'], true), 404);

        $this->authorizeSettingsKey($request, $key);

        $validated = $request->validate([
            'value' => 'required|array',
        ]);

        DB::table('platform_settings')->updateOrInsert(
            ['key' => $key],
            ['value' => json_encode($validated['value']), 'updated_at' => now()],
        );

        return response()->json([
            'message' => 'Settings saved.',
            'data' => $validated['value'],
        ]);
    }

    /** Public brand overrides (merged with frontend company.config.json on the client). */
    public function publicBrand(): JsonResponse
    {
        $row = DB::table('platform_settings')->where('key', 'brand')->first();
        $data = $row ? json_decode($row->value, true) : null;

        return response()->json([
            'data' => is_array($data) ? $data : null,
            'revision' => $row?->updated_at,
        ]);
    }

    /** Public ads for site placements (enabled only). */
    public function publicAds(Request $request): JsonResponse
    {
        $placement = $request->query('placement');
        $row = DB::table('platform_settings')->where('key', 'advertisements')->first();
        $ads = $row ? json_decode($row->value, true) : [];

        if (! is_array($ads)) {
            $ads = [];
        }

        $ads = array_values(array_filter($ads, function ($ad) {
            return ($ad['enabled'] ?? false)
                && ($ad['placement'] ?? '') !== 'admin_sidebar';
        }));

        if ($placement) {
            $ads = array_values(array_filter($ads, fn ($ad) => ($ad['placement'] ?? '') === $placement));
        }

        usort($ads, fn ($a, $b) => ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0));

        return response()->json([
            'data' => $ads,
            'revision' => $row?->updated_at,
        ]);
    }

    private function authorizeSettingsKey(Request $request, string $key): void
    {
        $user = $request->user();

        if ($key === 'brand') {
            if ($user->can('platform.manage')
                || $user->can('cms.homepage.manage')
                || $user->can('cms.pages.manage')) {
                return;
            }

            abort(403, 'You do not have permission to manage brand settings.');
        }

        if (! $user->can('platform.manage')) {
            abort(403, 'You do not have permission to manage platform settings.');
        }
    }
}
