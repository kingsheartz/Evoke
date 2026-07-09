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

        if (! $package->isTravelDateAllowed($data['travel_date'])) {
            throw new \InvalidArgumentException('Travel date is outside the package availability window.');
        }

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

    public function listAll(int $perPage = 20, ?string $status = null)
    {
        return Booking::with(['user', 'package'])
            ->when($status, fn ($query, $value) => $query->where('status', $value))
            ->latest()
            ->paginate($perPage);
    }

    public function update(Booking $booking, array $data): Booking
    {
        $booking->update($data);

        return $booking->fresh(['user', 'package']);
    }
}
