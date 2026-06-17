<?php

namespace App\Listeners\Notifications;

use App\Application\Notifications\Services\NotificationDispatcher;
use App\Events\Academy\EnrollmentCreated;
use App\Events\Shop\OrderPlaced;
use App\Events\Tours\BookingCreated;
use App\Events\Tours\EnquiryReceived;

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
        $this->dispatcher->dispatch('order.placed', $event->order->user, [
            'order_number' => $event->order->order_number,
            'total' => $event->order->total,
        ]);
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
}
