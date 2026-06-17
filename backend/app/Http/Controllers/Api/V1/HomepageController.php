<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HomepageController extends Controller
{
    public function show(): JsonResponse
    {
        $homepage = DB::table('homepage_settings')
            ->where('is_active', true)
            ->latest()
            ->first();

        if (! $homepage) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'hero' => [
                    'heading' => $homepage->hero_heading,
                    'subheading' => $homepage->hero_subheading,
                    'background_type' => $homepage->hero_background_type,
                    'background_url' => $homepage->hero_background_url,
                    'video_url' => $homepage->hero_video_url,
                    'cta_text' => $homepage->hero_cta_text,
                    'cta_url' => $homepage->hero_cta_url,
                ],
                'entry_cards' => json_decode($homepage->entry_cards ?? '[]', true),
                'meta' => json_decode($homepage->meta ?? '{}', true),
            ],
        ]);
    }
}
