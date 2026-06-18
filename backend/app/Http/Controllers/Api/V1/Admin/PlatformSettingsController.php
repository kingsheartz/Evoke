<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlatformSettingsController extends Controller
{
    public function show(string $key): JsonResponse
    {
        $row = DB::table('platform_settings')->where('key', $key)->first();

        return response()->json([
            'data' => $row ? json_decode($row->value, true) : null,
        ]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        abort_unless(in_array($key, ['admin_preferences', 'advertisements'], true), 404);

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

    /** Public ads for site placements (enabled only). */
    public function publicAds(Request $request): JsonResponse
    {
        $placement = $request->query('placement');
        $row = DB::table('platform_settings')->where('key', 'advertisements')->first();
        $ads = $row ? json_decode($row->value, true) : [];

        if ($placement) {
            $ads = array_values(array_filter($ads, fn ($ad) => ($ad['enabled'] ?? false) && ($ad['placement'] ?? '') === $placement));
        }

        usort($ads, fn ($a, $b) => ($a['sort_order'] ?? 0) <=> ($b['sort_order'] ?? 0));

        return response()->json(['data' => $ads]);
    }
}
