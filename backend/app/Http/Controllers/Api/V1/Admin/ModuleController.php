<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessModule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ModuleController extends Controller
{
    public function index(): JsonResponse
    {
        $modules = BusinessModule::orderBy('sort_order')->get();

        return response()->json(['data' => $modules]);
    }

    public function update(Request $request, BusinessModule $module): JsonResponse
    {
        $validated = $request->validate([
            'is_enabled' => 'sometimes|boolean',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $module->update($validated);
        Cache::forget("module.{$module->slug}.enabled");

        return response()->json(['data' => $module->fresh()]);
    }
}
