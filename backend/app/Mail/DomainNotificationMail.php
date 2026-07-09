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
            from: new Address($fromAddress, config('mail.from.name', 'EOKE Groups')),
            subject: $this->mailSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '<div style="font-family:sans-serif;line-height:1.6;color:#111">'.nl2br(e($this->body)).'</div>',
        );
    }
}
