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
            ['event' => 'course.enrollment', 'channel' => 'push', 'subject' => 'Enrollment update', 'body' => 'Your enrollment for {{course}} is {{status}}.'],
            ['event' => 'order.placed', 'channel' => 'in_app', 'subject' => null, 'body' => 'Order {{order_number}} placed. Total: ₹{{total}}'],
            ['event' => 'order.placed', 'channel' => 'email', 'subject' => 'Order Confirmation', 'body' => 'Thank you for your order {{order_number}}.'],
            ['event' => 'order.placed', 'channel' => 'push', 'subject' => 'Order confirmed', 'body' => 'Order {{order_number}} placed. Total: ₹{{total}}'],
            ['event' => 'booking.confirmed', 'channel' => 'in_app', 'subject' => null, 'body' => 'Booking {{booking_number}} for {{package}} received.'],
            ['event' => 'booking.confirmed', 'channel' => 'email', 'subject' => 'Tour Booking Received', 'body' => 'Your booking {{booking_number}} is being processed.'],
            ['event' => 'booking.confirmed', 'channel' => 'push', 'subject' => 'Tour booking received', 'body' => 'Booking {{booking_number}} for {{package}} is being processed.'],
            ['event' => 'tour.enquiry', 'channel' => 'email', 'subject' => 'New Tour Enquiry', 'body' => 'New enquiry from {{name}} ({{email}}).'],
            ['event' => 'payment.success', 'channel' => 'in_app', 'subject' => null, 'body' => 'Payment of ₹{{amount}} received successfully.'],
            ['event' => 'payment.success', 'channel' => 'push', 'subject' => 'Payment received', 'body' => 'Payment of ₹{{amount}} received successfully.'],
            ['event' => 'order.status_updated', 'channel' => 'in_app', 'subject' => null, 'body' => 'Order {{order_number}} is now {{status}}.{{tracking_line}}'],
            ['event' => 'order.status_updated', 'channel' => 'email', 'subject' => 'Order {{order_number}} update', 'body' => 'Your order {{order_number}} is now {{status}}.{{tracking_line}}'],
            ['event' => 'order.status_updated', 'channel' => 'push', 'subject' => 'Order update', 'body' => 'Order {{order_number}} is now {{status}}.{{tracking_line}}'],
            ['event' => 'enrollment.status_updated', 'channel' => 'in_app', 'subject' => null, 'body' => 'Your enrollment for {{course}} is now {{status}}.'],
            ['event' => 'enrollment.status_updated', 'channel' => 'email', 'subject' => 'Enrollment update — {{course}}', 'body' => 'Your enrollment for {{course}} is now {{status}}.'],
            ['event' => 'enrollment.status_updated', 'channel' => 'push', 'subject' => 'Enrollment update', 'body' => 'Your enrollment for {{course}} is now {{status}}.'],
            ['event' => 'booking.status_updated', 'channel' => 'in_app', 'subject' => null, 'body' => 'Booking {{booking_number}} for {{package}} is now {{status}}.'],
            ['event' => 'booking.status_updated', 'channel' => 'email', 'subject' => 'Booking {{booking_number}} update', 'body' => 'Your booking {{booking_number}} for {{package}} is now {{status}}.'],
            ['event' => 'booking.status_updated', 'channel' => 'push', 'subject' => 'Booking update', 'body' => 'Booking {{booking_number}} is now {{status}}.'],
            ['event' => 'certificate.issued', 'channel' => 'in_app', 'subject' => null, 'body' => 'Your certificate for {{course}} is ready ({{certificate_number}}).'],
            ['event' => 'certificate.issued', 'channel' => 'email', 'subject' => 'Certificate issued — {{course}}', 'body' => 'Your certificate for {{course}} is ready. Certificate number: {{certificate_number}}.'],
            ['event' => 'certificate.issued', 'channel' => 'push', 'subject' => 'Certificate ready', 'body' => 'Your certificate for {{course}} is ready.'],
            ['event' => 'attendance.alert', 'channel' => 'in_app', 'subject' => null, 'body' => 'Attendance for {{course}} on {{date}}: {{status}}.'],
            ['event' => 'attendance.alert', 'channel' => 'email', 'subject' => 'Attendance update — {{course}}', 'body' => 'Attendance for {{course}} on {{date}} was marked as {{status}}.'],
            ['event' => 'attendance.alert', 'channel' => 'push', 'subject' => 'Attendance update', 'body' => '{{course}} on {{date}}: {{status}}.'],
            ['event' => 'fee.reminder', 'channel' => 'email', 'subject' => 'Fee Reminder', 'body' => 'Your fee of ₹{{amount}} for {{course}} is due.'],
            ['event' => 'tour.reminder', 'channel' => 'email', 'subject' => 'Upcoming Tour Reminder', 'body' => 'Your tour to {{destination}} starts on {{date}}.'],
            ['event' => 'tour.reminder', 'channel' => 'push', 'subject' => 'Upcoming tour', 'body' => 'Your tour to {{destination}} starts on {{date}}.'],
        ];

        foreach ($templates as $template) {
            DB::table('notification_templates')->updateOrInsert(
                ['event' => $template['event'], 'channel' => $template['channel']],
                array_merge($template, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
