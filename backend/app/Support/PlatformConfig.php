<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class PlatformConfig
{
    /** @return array{razorpay_enabled: bool, payment_link_url: string|null, payment_link_label: string, contact_email: string, contact_whatsapp: string} */
    public static function payments(): array
    {
        $defaults = [
            'razorpay_enabled' => false,
            'payment_link_url' => null,
            'payment_link_label' => 'Pay online',
            'contact_email' => 'evokeacademy@gmail.com',
            'contact_whatsapp' => '917902264073',
        ];

        $row = DB::table('platform_settings')->where('key', 'payments')->first();
        if (! $row) {
            return $defaults;
        }

        $stored = json_decode($row->value, true);
        if (! is_array($stored)) {
            return $defaults;
        }

        return array_merge($defaults, $stored);
    }

    public static function razorpayEnabled(): bool
    {
        $payments = self::payments();

        return (bool) ($payments['razorpay_enabled'] ?? false);
    }
}
