<?php

namespace App\Http\Controllers\Api\V1\Academy;

use App\Http\Controllers\Controller;
use App\Models\Academy\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TrainerController extends Controller
{
    public function adminIndex(Request $request): JsonResponse
    {
        $trainers = Trainer::query()
            ->when($request->search, fn ($q, $search) => $q->whereLikeInsensitive('name', "%{$search}%"))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 20));

        return response()->json($trainers);
    }

    public function adminShow(Trainer $trainer): JsonResponse
    {
        return response()->json(['data' => $trainer]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'photo' => 'nullable|string',
            'specializations' => 'nullable|array',
            'certifications' => 'nullable|array',
            'branch_id' => 'nullable|exists:branches,id',
            'is_active' => 'boolean',
        ]);

        $trainer = Trainer::create([
            ...$validated,
            'slug' => Str::slug($validated['name']).'-'.Str::random(4),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $trainer], 201);
    }

    public function update(Request $request, Trainer $trainer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'bio' => 'nullable|string',
            'photo' => 'nullable|string',
            'specializations' => 'nullable|array',
            'certifications' => 'nullable|array',
            'branch_id' => 'nullable|exists:branches,id',
            'is_active' => 'boolean',
        ]);

        $trainer->update($validated);

        return response()->json(['data' => $trainer->fresh()]);
    }

    public function destroy(Trainer $trainer): JsonResponse
    {
        $trainer->delete();

        return response()->json(['message' => 'Trainer deleted.']);
    }
}
