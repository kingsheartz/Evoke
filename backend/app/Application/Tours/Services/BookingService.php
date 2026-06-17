<?php

namespace App\Application\Tours\Services;

use App\Models\Tours\Booking;
use App\Models\Tours\Package;
use App\Models\User;
use Illuminate\Support\Str;

class BookingService
{
    public function create(User $user, array $data): Booking
    {
        $package = Package::findOrFail($data['package_id']);
        $total = $package->price * $data['travelers_count'];

        return Booking::create([
            'booking_number' => 'EVK-T-'.strtoupper(Str::random(8)),
            'user_id' => $user->id,
            'package_id' => $package->id,
            'travel_date' => $data['travel_date'],
            'travelers_count' => $data['travelers_count'],
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'total_amount' => $total,
            'traveler_details' => $data['traveler_details'] ?? null,
            'special_requests' => $data['special_requests'] ?? null,
        ]);
    }

    public function listForUser(int $userId, int $perPage = 15)
    {
        return Booking::with('package')
            ->where('user_id', $userId)
            ->latest()
            ->paginate($perPage);
    }
}
