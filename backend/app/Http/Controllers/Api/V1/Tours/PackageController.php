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
        $sort = $request->input('sort', 'newest');
        $search = $request->input('q', $request->input('search'));

        $packages = Package::query()
            ->where('is_active', true)
            ->with('itineraryDays')
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->when(filled($search), function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->whereLikeInsensitive('title', "%{$search}%")
                        ->orWhereLikeInsensitive('destination', "%{$search}%")
                        ->orWhereLikeInsensitive('description', "%{$search}%");
                });
            })
            ->when($request->filled('min_price'), fn ($q) => $q->where('price', '>=', $request->input('min_price')))
            ->when($request->filled('max_price'), fn ($q) => $q->where('price', '<=', $request->input('max_price')));

        match ($sort) {
            'price_asc' => $packages->orderBy('price')->orderBy('title'),
            'price_desc' => $packages->orderByDesc('price')->orderBy('title'),
            'name_asc' => $packages->orderBy('title'),
            'name_desc' => $packages->orderByDesc('title'),
            'featured' => $packages->orderByDesc('is_featured')->orderByDesc('created_at'),
            default => $packages->latest(),
        };

        return response()->json($packages->paginate($request->integer('per_page', 24)));
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
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
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
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
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
