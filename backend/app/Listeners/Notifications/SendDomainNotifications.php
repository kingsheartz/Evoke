<?php

namespace App\Listeners\Notifications;

use App\Application\Notifications\Services\NotificationDispatcher;
use App\Events\Academy\EnrollmentCreated;
use App\Events\Shop\OrderPlaced;
use App\Events\Shop\PaymentSucceeded;
use App\Events\Tours\BookingCreated;
use App\Events\Tours\EnquiryReceived;
use App\Support\PlatformConfig;

class SendDomainNotifications
{
    public function __construct(
        private readonly NotificationDispatcher $dispatcher,
    ) {}

    public function handleEnrollment(EnrollmentCreated $event): void
    {
        $this->dispatcher->dispatch('course.enrollment', $event->enrollment->user, [
            'course' => $event->enrollment->batch->course->title ?? 'Course',
            'status' => $event->enrollment->status,
        ]);
    }

    public function handleOrder(OrderPlaced $event): void
    {
        $channels = ['in_app', 'email', 'push'];

        // Razorpay checkout: email receipt now; in-app + push after payment.success.
        if (PlatformConfig::razorpayEnabled() && $event->order->payment_status !== 'paid') {
            $channels = ['email'];
        }

        $this->dispatcher->dispatch('order.placed', $event->order->user, [
            'order_number' => $event->order->order_number,
            'total' => $event->order->total,
        ], channels: $channels);
    }

    public function handleBooking(BookingCreated $event): void
    {
        $this->dispatcher->dispatch('booking.confirmed', $event->booking->user, [
            'booking_number' => $event->booking->booking_number,
            'package' => $event->booking->package->title ?? 'Tour Package',
        ]);
    }

    public function handleEnquiry(EnquiryReceived $event): void
    {
        $this->dispatcher->dispatch('tour.enquiry', null, [
            'name' => $event->enquiry->name,
            'email' => $event->enquiry->email,
            'package_id' => $event->enquiry->package_id,
        ], channels: ['email']);
    }

    public function handlePaymentSuccess(PaymentSucceeded $event): void
    {
        $this->dispatcher->dispatch('payment.success', $event->order->user, [
            'amount' => $event->amount,
            'order_number' => $event->order->order_number,
            'total' => $event->order->total,
        ], channels: ['in_app', 'push']);
    }
}
