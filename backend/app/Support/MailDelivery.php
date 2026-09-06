<?php

namespace App\Support;

class MailDelivery
{
    public static function defaultMailer(): string
    {
        $mailer = (string) config('mail.default', 'failover');

        return $mailer !== '' ? $mailer : 'failover';
    }

    public static function isDeliverable(): bool
    {
        $mailer = self::defaultMailer();

        if (in_array($mailer, ['log', 'array'], true)) {
            return false;
        }

        return self::isMailerDeliverable($mailer);
    }

    /** Newsletter campaigns prefer SMTP so bulk updates stay separate from transactional Resend. */
    public static function newsletterMailer(): string
    {
        $configured = trim((string) env('NEWSLETTER_MAILER', 'smtp'));

        if ($configured !== '' && self::isMailerDeliverable($configured)) {
            return $configured;
        }

        if (self::isMailerDeliverable('smtp')) {
            return 'smtp';
        }

        return self::defaultMailer();
    }

    public static function isNewsletterDeliverable(): bool
    {
        return self::isMailerDeliverable(self::newsletterMailer());
    }

    public static function isMailerDeliverable(string $mailer): bool
    {
        if (in_array($mailer, ['log', 'array'], true)) {
            return false;
        }

        if ($mailer === 'failover') {
            $chain = config('mail.mailers.failover.mailers', []);

            if (! is_array($chain) || $chain === []) {
                return false;
            }

            return ! (count($chain) === 1 && $chain[0] === 'log');
        }

        if ($mailer === 'resend') {
            return filled(config('services.resend.key'));
        }

        if ($mailer === 'smtp') {
            return filled(env('MAIL_HOST')) && filled(env('MAIL_USERNAME')) && filled(env('MAIL_PASSWORD'));
        }

        return true;
    }
}
