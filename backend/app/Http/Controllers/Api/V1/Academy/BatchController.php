<?php

namespace App\Http\Controllers\Api\V1\Academy;

use App\Http\Controllers\Controller;
use App\Models\Academy\Batch;
use App\Models\Academy\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        return response()->json([
            'data' => $course->batches()->orderBy('start_date')->get(),
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'trainer_id' => 'nullable|exists:academy_trainers,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'nullable|string|in:upcoming,open,active,completed,cancelled',
        ]);

        $batch = $course->batches()->create([
            ...$validated,
            'capacity' => $validated['capacity'] ?? 20,
            'status' => $validated['status'] ?? 'upcoming',
        ]);

        return response()->json(['data' => $batch], 201);
    }

    public function update(Request $request, Course $course, Batch $batch): JsonResponse
    {
        abort_unless($batch->course_id === $course->id, 404);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'capacity' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string|in:upcoming,open,active,completed,cancelled',
            'trainer_id' => 'nullable|exists:academy_trainers,id',
        ]);

        $batch->update($validated);

        return response()->json(['data' => $batch->fresh()]);
    }

    public function destroy(Course $course, Batch $batch): JsonResponse
    {
        abort_unless($batch->course_id === $course->id, 404);
        $batch->delete();

        return response()->json(['message' => 'Batch deleted.']);
    }
}
