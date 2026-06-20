<?php

namespace App\Http\Controllers\Api\V1\Academy;

use App\Http\Controllers\Controller;
use App\Models\Academy\Certificate;
use App\Models\Academy\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    public function adminIndex(Request $request): JsonResponse
    {
        $certificates = Certificate::query()
            ->with(['enrollment.user', 'enrollment.batch.course'])
            ->latest('issued_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($certificates);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:academy_enrollments,id',
            'file_path' => 'nullable|string|max:500',
        ]);

        $enrollment = Enrollment::with('batch.course', 'user')->findOrFail($validated['enrollment_id']);
        abort_unless(in_array($enrollment->status, ['approved', 'completed'], true), 422, 'Enrollment must be approved first.');

        $certificate = Certificate::create([
            'enrollment_id' => $enrollment->id,
            'certificate_number' => 'CERT-'.strtoupper(Str::random(10)),
            'file_path' => $validated['file_path'] ?? null,
            'issued_at' => now(),
        ]);

        return response()->json(['data' => $certificate->load(['enrollment.user', 'enrollment.batch.course'])], 201);
    }

    public function indexForUser(Request $request): JsonResponse
    {
        $certificates = Certificate::query()
            ->whereHas('enrollment', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['enrollment.batch.course'])
            ->latest('issued_at')
            ->get();

        return response()->json(['data' => $certificates]);
    }
}
