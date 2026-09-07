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

    /** Newsletter bulk sends use SMTP only; transactional mail uses MAIL_MAILER (failover). */
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

    /**
     * Fail fast when SMTP ports are blocked (e.g. Render free tier) instead of hanging until 502.
     *
     * @throws \RuntimeException
     */
    public static function assertNewsletterTransportReady(): void
    {
        $mailer = self::newsletterMailer();

        if ($mailer !== 'smtp') {
            return;
        }

        $host = trim((string) env('MAIL_HOST', ''));
        $port = (int) env('MAIL_PORT', 587);

        if ($host === '') {
            throw new \RuntimeException('MAIL_HOST is not configured for newsletter SMTP.');
        }

        $errno = 0;
        $errstr = '';
        $socket = @fsockopen($host, $port, $errno, $errstr, 5);

        if ($socket === false) {
            throw new \RuntimeException(
                "Cannot connect to SMTP {$host}:{$port}".($errstr !== '' ? " ({$errstr})" : '').
                '. Render free tier blocks SMTP ports 587/465/25 — set NEWSLETTER_MAILER=resend (HTTP API) or upgrade Render to a paid instance.'
            );
        }

        fclose($socket);
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
