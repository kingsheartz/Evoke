<?php

namespace App\Http\Controllers\Api\V1\Academy;

use App\Application\Academy\Services\EnrollmentService;
use App\Application\Notifications\Services\AdminUserNotifier;
use App\Events\Academy\EnrollmentCreated;
use App\Http\Controllers\Controller;
use App\Models\Academy\Enrollment;
use App\Support\ProfileRequirements;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function __construct(
        private readonly EnrollmentService $enrollmentService,
        private readonly AdminUserNotifier $adminUserNotifier,
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->user()->hasRole(['super-admin', 'academy-manager'])) {
            $enrollments = $this->enrollmentService->listAll($request->integer('per_page', 15));

            return response()->json($enrollments);
        }

        $enrollments = $this->enrollmentService->listForUser($request->user()->id);

        return response()->json(['data' => $enrollments]);
    }

    public function store(Request $request): JsonResponse
    {
        $profileMessage = ProfileRequirements::courseOrTravelMessage($request->user());
        if ($profileMessage) {
            abort(422, $profileMessage);
        }

        $validated = $request->validate([
            'batch_id' => 'required|exists:academy_batches,id',
        ]);

        $enrollment = $this->enrollmentService->enroll($request->user(), $validated['batch_id']);

        EnrollmentCreated::dispatch($enrollment);

        return response()->json(['data' => $enrollment->load('batch.course')], 201);
    }

    public function adminUpdate(Request $request, Enrollment $enrollment): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,approved,rejected,cancelled,completed',
            'payment_status' => 'sometimes|string|in:unpaid,paid,refunded',
            'payment_reference' => 'nullable|string|max:255',
            'amount_paid' => 'sometimes|numeric|min:0',
        ]);

        $previousStatus = $enrollment->status;
        $enrollment = $this->enrollmentService->update($enrollment, $validated);

        if (array_key_exists('status', $validated)) {
            $this->adminUserNotifier->enrollmentStatusUpdated($enrollment, $previousStatus);
        }

        return response()->json(['data' => $enrollment]);
    }
}
