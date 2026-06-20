<?php

namespace App\Http\Controllers\Api\V1\Tours;

use App\Application\Tours\Services\BookingService;
use App\Events\Tours\BookingCreated;
use App\Http\Controllers\Controller;
use App\Models\Tours\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $bookings = $this->bookingService->listForUser($request->user()->id, $request->integer('per_page', 15));

        return response()->json($bookings);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:tour_packages,id',
            'travel_date' => 'required|date|after:today',
            'travelers_count' => 'required|integer|min:1|max:20',
            'traveler_details' => 'nullable|array',
            'special_requests' => 'nullable|string',
        ]);

        $booking = $this->bookingService->create($request->user(), $validated);

        BookingCreated::dispatch($booking);

        return response()->json(['data' => $booking->load('package')], 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $bookings = $this->bookingService->listAll(
            $request->integer('per_page', 20),
            $request->query('status'),
        );

        return response()->json($bookings);
    }

    public function adminUpdate(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,confirmed,cancelled,completed',
            'payment_status' => 'sometimes|string|in:unpaid,paid,refunded',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        $booking = $this->bookingService->update($booking, $validated);

        return response()->json(['data' => $booking]);
    }
}
