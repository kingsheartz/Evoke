<?php

namespace App\Http\Controllers\Api\V1\Tours;

use App\Http\Controllers\Controller;
use App\Models\Tours\ItineraryDay;
use App\Models\Tours\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItineraryController extends Controller
{
    public function index(Package $package): JsonResponse
    {
        return response()->json([
            'data' => $package->itineraryDays()->orderBy('day_number')->get(),
        ]);
    }

    public function store(Request $request, Package $package): JsonResponse
    {
        $validated = $request->validate([
            'day_number' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'activities' => 'nullable|array',
            'accommodation' => 'nullable|string',
            'meals' => 'nullable|array',
        ]);

        $day = $package->itineraryDays()->create($validated);

        return response()->json(['data' => $day], 201);
    }

    public function update(Request $request, Package $package, ItineraryDay $day): JsonResponse
    {
        abort_unless($day->package_id === $package->id, 404);

        $validated = $request->validate([
            'day_number' => 'sometimes|integer|min:1',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'activities' => 'nullable|array',
            'accommodation' => 'nullable|string',
            'meals' => 'nullable|array',
        ]);

        $day->update($validated);

        return response()->json(['data' => $day->fresh()]);
    }

    public function destroy(Package $package, ItineraryDay $day): JsonResponse
    {
        abort_unless($day->package_id === $package->id, 404);
        $day->delete();

        return response()->json(['message' => 'Itinerary day deleted.']);
    }
}
