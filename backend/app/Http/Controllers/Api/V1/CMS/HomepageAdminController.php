<?php

namespace App\Http\Controllers\Api\V1\CMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomepageAdminController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hero_heading' => 'nullable|string',
            'hero_subheading' => 'nullable|string',
            'hero_background_type' => 'nullable|string|in:image,video,gradient',
            'hero_background_url' => 'nullable|string',
            'hero_video_url' => 'nullable|string',
            'hero_cta_text' => 'nullable|string',
            'hero_cta_url' => 'nullable|string',
            'entry_cards' => 'nullable|array',
            'meta' => 'nullable|array',
        ]);

        $homepage = DB::table('homepage_settings')->where('is_active', true)->first();

        if ($homepage) {
            DB::table('homepage_settings')->where('id', $homepage->id)->update([
                ...$validated,
                'entry_cards' => isset($validated['entry_cards']) ? json_encode($validated['entry_cards']) : $homepage->entry_cards,
                'meta' => isset($validated['meta']) ? json_encode($validated['meta']) : $homepage->meta,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('homepage_settings')->insert([
                ...$validated,
                'entry_cards' => json_encode($validated['entry_cards'] ?? []),
                'meta' => json_encode($validated['meta'] ?? []),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Homepage updated successfully.']);
    }
}
