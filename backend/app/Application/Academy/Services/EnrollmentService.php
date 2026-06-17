<?php

namespace App\Application\Academy\Services;

use App\Models\Academy\Batch;
use App\Models\Academy\Enrollment;
use App\Models\User;

class EnrollmentService
{
    public function enroll(User $user, int $batchId): Enrollment
    {
        $batch = Batch::with('course')->findOrFail($batchId);

        $activeCount = $batch->enrollments()->whereIn('status', ['pending', 'approved'])->count();
        if ($activeCount >= $batch->capacity) {
            abort(422, 'Batch is full.');
        }

        return Enrollment::firstOrCreate(
            ['user_id' => $user->id, 'batch_id' => $batchId],
            [
                'status' => $batch->course->requires_approval ? 'pending' : 'approved',
                'payment_status' => 'unpaid',
                'enrolled_at' => $batch->course->requires_approval ? null : now(),
            ]
        );
    }

    public function listForUser(int $userId)
    {
        return Enrollment::with(['batch.course', 'batch.trainer'])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function listAll(int $perPage = 15)
    {
        return Enrollment::with(['user', 'batch.course'])
            ->latest()
            ->paginate($perPage);
    }
}
