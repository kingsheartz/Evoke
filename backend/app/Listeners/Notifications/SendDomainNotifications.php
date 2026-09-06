<?php

namespace App\Listeners\Notifications;

use App\Application\Notifications\Services\NotificationDispatcher;
use App\Application\Payments\Services\PaymentService;
use App\Events\Academy\EnrollmentCreated;
use App\Events\Shop\OrderPlaced;
use App\Events\Shop\PaymentSucceeded;
use App\Events\Tours\BookingCreated;
use App\Events\Tours\EnquiryReceived;
use App\Models\Shop\Order;

class SendDomainNotifications
{
    public function __construct(
        private readonly NotificationDispatcher $dispatcher,
        private readonly PaymentService $payments,
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
        $order = $event->order->loadMissing('user');
        if (! $order->user) {
            return;
        }

        $payload = [
            'order_number' => $order->order_number,
            'total' => $order->total,
        ];

        // Razorpay: email + inbox on place; push on payment.success (one per channel).
        if ($this->razorpayCheckoutPending($order)) {
            $this->dispatcher->dispatch('order.placed', $order->user, $payload, channels: ['in_app', 'email']);

            return;
        }

        $this->dispatcher->dispatch('order.placed', $order->user, $payload);
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
        $order = $event->order->loadMissing('user');
        if (! $order->user) {
            return;
        }

        $this->dispatcher->dispatch('payment.success', $order->user, [
            'amount' => $event->amount,
            'order_number' => $order->order_number,
            'total' => $order->total,
        ], channels: ['in_app', 'push']);
    }

    private function razorpayCheckoutPending(Order $order): bool
    {
        return $order->payment_status !== 'paid' && $this->payments->isConfigured();
    }
}
