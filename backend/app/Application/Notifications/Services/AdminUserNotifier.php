<?php

namespace App\Application\Notifications\Services;

use App\Models\Academy\Attendance;
use App\Models\Academy\Certificate;
use App\Models\Academy\Enrollment;
use App\Models\Shop\Order;
use App\Models\Tours\Booking;

class AdminUserNotifier
{
    public function __construct(
        private readonly NotificationDispatcher $dispatcher,
    ) {}

    public function orderStatusUpdated(Order $order, string $previousStatus): void
    {
        if ($order->status === $previousStatus || ! $order->user) {
            return;
        }

        $trackingLine = $order->tracking_number
            ? ' Tracking: '.$order->tracking_number.'.'
            : '';

        $this->dispatcher->dispatch('order.status_updated', $order->user, [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'previous_status' => $previousStatus,
            'tracking_number' => $order->tracking_number ?? '',
            'tracking_line' => $trackingLine,
        ]);
    }

    public function enrollmentStatusUpdated(Enrollment $enrollment, string $previousStatus): void
    {
        if ($enrollment->status === $previousStatus || ! $enrollment->user) {
            return;
        }

        $this->dispatcher->dispatch('enrollment.status_updated', $enrollment->user, [
            'course' => $enrollment->batch->course->title ?? 'Course',
            'status' => $enrollment->status,
            'previous_status' => $previousStatus,
        ]);
    }

    public function bookingStatusUpdated(Booking $booking, string $previousStatus): void
    {
        if ($booking->status === $previousStatus || ! $booking->user) {
            return;
        }

        $this->dispatcher->dispatch('booking.status_updated', $booking->user, [
            'booking_number' => $booking->booking_number,
            'package' => $booking->package->title ?? 'Tour Package',
            'status' => $booking->status,
            'previous_status' => $previousStatus,
        ]);
    }

    public function certificateIssued(Certificate $certificate): void
    {
        $enrollment = $certificate->enrollment;
        if (! $enrollment?->user) {
            return;
        }

        $this->dispatcher->dispatch('certificate.issued', $enrollment->user, [
            'course' => $enrollment->batch->course->title ?? 'Course',
            'certificate_number' => $certificate->certificate_number,
        ]);
    }

    public function attendanceMarked(Attendance $record): void
    {
        $enrollment = $record->enrollment;
        if (! $enrollment?->user) {
            return;
        }

        $this->dispatcher->dispatch('attendance.alert', $enrollment->user, [
            'course' => $enrollment->batch->course->title ?? 'Course',
            'date' => $record->date?->format('Y-m-d') ?? (string) $record->date,
            'status' => $record->status,
        ]);
    }
}
