<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            ['event' => 'course.enrollment', 'channel' => 'in_app', 'subject' => null, 'body' => 'Your enrollment for {{course}} is {{status}}.'],
            ['event' => 'course.enrollment', 'channel' => 'email', 'subject' => 'Course Enrollment Update', 'body' => 'Your enrollment for {{course}} is {{status}}.'],
            ['event' => 'order.placed', 'channel' => 'in_app', 'subject' => null, 'body' => 'Order {{order_number}} placed. Total: ₹{{total}}'],
            ['event' => 'order.placed', 'channel' => 'email', 'subject' => 'Order Confirmation', 'body' => 'Thank you for your order {{order_number}}.'],
            ['event' => 'booking.confirmed', 'channel' => 'in_app', 'subject' => null, 'body' => 'Booking {{booking_number}} for {{package}} received.'],
            ['event' => 'booking.confirmed', 'channel' => 'email', 'subject' => 'Tour Booking Received', 'body' => 'Your booking {{booking_number}} is being processed.'],
            ['event' => 'tour.enquiry', 'channel' => 'email', 'subject' => 'New Tour Enquiry', 'body' => 'New enquiry from {{name}} ({{email}}).'],
            ['event' => 'payment.success', 'channel' => 'in_app', 'subject' => null, 'body' => 'Payment of ₹{{amount}} received successfully.'],
            ['event' => 'attendance.alert', 'channel' => 'in_app', 'subject' => null, 'body' => 'Attendance marked for {{course}} on {{date}}.'],
            ['event' => 'fee.reminder', 'channel' => 'email', 'subject' => 'Fee Reminder', 'body' => 'Your fee of ₹{{amount}} for {{course}} is due.'],
            ['event' => 'tour.reminder', 'channel' => 'email', 'subject' => 'Upcoming Tour Reminder', 'body' => 'Your tour to {{destination}} starts on {{date}}.'],
        ];

        foreach ($templates as $template) {
            DB::table('notification_templates')->updateOrInsert(
                ['event' => $template['event'], 'channel' => $template['channel']],
                array_merge($template, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
