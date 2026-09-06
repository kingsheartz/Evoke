<?php

namespace App\Support;

class NotificationTemplateDefaults
{
    /** @return array{subject: string|null, body: string}|null */
    public static function for(string $event, string $channel): ?array
    {
        $templates = [
            'order.placed' => [
                'in_app' => ['subject' => null, 'body' => 'Order {{order_number}} placed. Total: ₹{{total}}'],
                'email' => ['subject' => 'Order Confirmation', 'body' => "Thank you for your order {{order_number}}.\n\nOrder total: ₹{{total}}\n\nWe'll notify you when payment is confirmed and when your order ships."],
                'push' => ['subject' => 'Order confirmed', 'body' => 'Order {{order_number}} placed. Total: ₹{{total}}'],
            ],
            'payment.success' => [
                'in_app' => ['subject' => null, 'body' => 'Order {{order_number}} confirmed. Payment of ₹{{amount}} received.'],
                'email' => ['subject' => 'Payment received — Order {{order_number}}', 'body' => "Payment of ₹{{amount}} received for order {{order_number}}.\n\nThank you for shopping with us."],
                'push' => ['subject' => 'Order confirmed', 'body' => 'Order {{order_number}} confirmed. Payment of ₹{{amount}} received.'],
            ],
        ];

        return $templates[$event][$channel] ?? null;
    }
}
