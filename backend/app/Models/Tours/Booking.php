<?php

namespace App\Models\Tours;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes;

    protected $table = 'tour_bookings';

    protected $fillable = [
        'booking_number', 'user_id', 'package_id', 'travel_date', 'travelers_count',
        'status', 'payment_status', 'payment_reference', 'total_amount',
        'traveler_details', 'special_requests',
    ];

    protected function casts(): array
    {
        return [
            'travel_date' => 'date',
            'total_amount' => 'decimal:2',
            'traveler_details' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }
}
