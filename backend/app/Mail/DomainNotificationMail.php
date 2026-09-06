<?php

namespace App\Mail;

use App\Support\PlatformConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DomainNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $mailSubject,
        public string $body,
    ) {}

    public function envelope(): Envelope
    {
        $fromAddress = config('mail.from.address') ?: PlatformConfig::payments()['contact_email'];

        return new Envelope(
            from: new Address(trim($fromAddress), config('mail.from.name', 'EOKE Groups')),
            subject: $this->mailSubject,
        );
    }

    public function content(): Content
    {
        $frontendUrl = rtrim((string) env('FRONTEND_URL', config('app.url')), '/');
        $brandName = config('mail.from.name', config('app.name', 'EOKE Groups'));

        return new Content(
            view: 'mail.domain-notification',
            with: [
                'mailSubject' => $this->mailSubject,
                'body' => $this->body,
                'brandName' => $brandName,
                'siteUrl' => $frontendUrl !== '' ? $frontendUrl : null,
                'logoUrl' => $frontendUrl !== '' ? $frontendUrl.'/icon-512.png' : null,
            ],
        );
    }
}
