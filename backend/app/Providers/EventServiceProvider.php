<?php

namespace App\Providers;

use App\Events\Academy\EnrollmentCreated;
use App\Events\Shop\OrderPlaced;
use App\Events\Shop\PaymentSucceeded;
use App\Events\Tours\BookingCreated;
use App\Events\Tours\EnquiryReceived;
use App\Listeners\Notifications\SendDomainNotifications;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /** Manual map in $listen — do not also auto-discover (duplicates every notification). */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }

    protected $listen = [
        EnrollmentCreated::class => [
            [SendDomainNotifications::class, 'handleEnrollment'],
        ],
        OrderPlaced::class => [
            [SendDomainNotifications::class, 'handleOrder'],
        ],
        BookingCreated::class => [
            [SendDomainNotifications::class, 'handleBooking'],
        ],
        EnquiryReceived::class => [
            [SendDomainNotifications::class, 'handleEnquiry'],
        ],
        PaymentSucceeded::class => [
            [SendDomainNotifications::class, 'handlePaymentSuccess'],
        ],
    ];
}
