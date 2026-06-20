<?php

namespace App\Http\Controllers\Api\V1\Tours;

use App\Application\Tours\Services\BookingService;
use App\Events\Tours\BookingCreated;
use App\Http\Controllers\Controller;
use App\Models\Tours\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PackageController extends Controller
{
    public function adminIndex(Request $request): JsonResponse
    {
        $packages = Package::query()
            ->with('itineraryDays')
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->search, fn ($q, $s) => $q->whereLikeInsensitive('title', "%{$s}%"))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($packages);
    }

    public function adminShow(Package $package): JsonResponse
    {
        return response()->json(['data' => $package->load('itineraryDays')]);
    }

    public function index(Request $request): JsonResponse
    {
        $packages = Package::query()
            ->where('is_active', true)
            ->with('itineraryDays')
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->featured, fn ($q) => $q->where('is_featured', true))
            ->paginate($request->integer('per_page', 15));

        return response()->json($packages);
    }

    public function show(string $slug): JsonResponse
    {
        $package = Package::where('slug', $slug)
            ->where('is_active', true)
            ->with('itineraryDays')
            ->firstOrFail();

        return response()->json(['data' => $package]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'destination' => 'required|string',
            'type' => 'required|string|in:domestic,international,adventure,group,custom',
            'duration_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'gallery' => 'nullable|array',
            'inclusions' => 'nullable|array',
            'exclusions' => 'nullable|array',
        ]);

        $package = Package::create([
            ...$validated,
            'slug' => Str::slug($validated['title']).'-'.Str::random(4),
        ]);

        return response()->json(['data' => $package], 201);
    }

    public function update(Request $request, Package $package): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'destination' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:domestic,international,adventure,group,custom',
            'duration_days' => 'sometimes|integer|min:1',
            'price' => 'sometimes|numeric|min:0',
            'gallery' => 'nullable|array',
            'inclusions' => 'nullable|array',
            'exclusions' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'related_slugs' => 'nullable|array',
            'related_slugs.*' => 'string|max:255',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
        ]);

        $package->update($validated);

        return response()->json(['data' => $package->fresh('itineraryDays')]);
    }
}
