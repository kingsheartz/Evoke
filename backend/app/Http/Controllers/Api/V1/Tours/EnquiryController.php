<?php

namespace App\Http\Controllers\Api\V1\Tours;

use App\Events\Tours\EnquiryReceived;
use App\Http\Controllers\Controller;
use App\Models\Tours\Enquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnquiryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_id' => 'nullable|exists:tour_packages,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'travelers_count' => 'nullable|integer|min:1',
            'preferred_date' => 'nullable|date',
            'message' => 'nullable|string',
        ]);

        $enquiry = Enquiry::create($validated);

        EnquiryReceived::dispatch($enquiry);

        return response()->json(['data' => $enquiry, 'message' => 'Enquiry submitted successfully.'], 201);
    }
}
