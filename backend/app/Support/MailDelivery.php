<?php

namespace App\Support;

class MailDelivery
{
    public static function defaultMailer(): string
    {
        $configured = config('mail.default', 'failover');

        if ($configured !== 'failover') {
            return $configured;
        }

        $chain = config('mail.mailers.failover.mailers', []);
        if (is_array($chain) && $chain !== []) {
            return 'failover';
        }

        if (filled(config('services.resend.key')) || filled(env('RESEND_API_KEY'))) {
            return 'resend';
        }

        if (filled(env('MAIL_HOST')) && filled(env('MAIL_USERNAME')) && filled(env('MAIL_PASSWORD'))) {
            return 'smtp';
        }

        return 'log';
    }
}
