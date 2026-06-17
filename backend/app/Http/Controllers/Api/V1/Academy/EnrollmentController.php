<?php

namespace App\Http\Controllers\Api\V1\Academy;

use App\Application\Academy\Services\EnrollmentService;
use App\Events\Academy\EnrollmentCreated;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function __construct(
        private readonly EnrollmentService $enrollmentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $enrollments = $request->user()
            ->hasRole(['super-admin', 'academy-manager'])
            ? $this->enrollmentService->listAll($request->integer('per_page', 15))
            : $this->enrollmentService->listForUser($request->user()->id);

        return response()->json($enrollments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:academy_batches,id',
        ]);

        $enrollment = $this->enrollmentService->enroll($request->user(), $validated['batch_id']);

        EnrollmentCreated::dispatch($enrollment);

        return response()->json(['data' => $enrollment->load('batch.course')], 201);
    }
}
