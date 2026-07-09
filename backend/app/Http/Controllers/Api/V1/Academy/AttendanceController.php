<?php

namespace App\Http\Controllers\Api\V1\Academy;

use App\Http\Controllers\Controller;
use App\Models\Academy\Attendance;
use App\Models\Academy\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function adminIndex(Request $request): JsonResponse
    {
        $records = Attendance::query()
            ->with(['enrollment.user', 'enrollment.batch.course', 'markedBy'])
            ->when($request->date, fn ($q, $date) => $q->whereDate('date', $date))
            ->when($request->enrollment_id, fn ($q, $id) => $q->where('enrollment_id', $id))
            ->when($request->course_id, fn ($q, $courseId) => $q->whereHas('enrollment.batch', fn ($batch) => $batch->where('course_id', $courseId)))
            ->latest('date')
            ->paginate($request->integer('per_page', 30));

        return response()->json($records);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:academy_enrollments,id',
            'date' => 'required|date',
            'status' => 'required|string|in:present,absent,late,excused',
            'method' => 'nullable|string|in:manual,qr',
        ]);

        $record = Attendance::updateOrCreate(
            [
                'enrollment_id' => $validated['enrollment_id'],
                'date' => $validated['date'],
            ],
            [
                'status' => $validated['status'],
                'method' => $validated['method'] ?? 'manual',
                'marked_by' => $request->user()->id,
            ],
        );

        return response()->json(['data' => $record->load(['enrollment.user', 'enrollment.batch.course'])], 201);
    }

    public function enrollmentsForMarking(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'batch_id' => 'nullable|exists:academy_batches,id',
            'course_id' => 'nullable|exists:academy_courses,id',
        ]);

        $enrollments = Enrollment::query()
            ->with(['user', 'batch.course'])
            ->whereIn('status', ['approved', 'completed'])
            ->when($validated['batch_id'] ?? null, fn ($q, $batchId) => $q->where('batch_id', $batchId))
            ->when($validated['course_id'] ?? null, fn ($q, $courseId) => $q->whereHas('batch', fn ($batch) => $batch->where('course_id', $courseId)))
            ->latest()
            ->paginate($request->integer('per_page', 50));

        return response()->json($enrollments);
    }
}
