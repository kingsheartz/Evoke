<?php

namespace App\Events\Tours;

use App\Models\Tours\Booking;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public Booking $booking) {}
}
