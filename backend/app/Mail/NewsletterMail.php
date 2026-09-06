<?php

namespace App\Mail;

use App\Models\Newsletter\NewsletterCampaign;
use App\Models\Newsletter\NewsletterSubscriber;
use App\Support\MailBranding;
use App\Support\PlatformConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public NewsletterCampaign $campaign,
        public NewsletterSubscriber $subscriber,
        public bool $isTest = false,
    ) {}

    public function envelope(): Envelope
    {
        $fromAddress = config('mail.from.address') ?: PlatformConfig::payments()['contact_email'];
        $brand = MailBranding::resolve();
        $subject = $this->campaign->subject;

        if ($this->isTest) {
            $subject = '[Test] '.$subject;
        }

        return new Envelope(
            from: new Address(trim($fromAddress), $brand['name']),
            subject: $subject,
        );
    }

    public function content(): Content
    {
        $brand = MailBranding::resolve();
        $unsubscribeUrl = $this->isTest
            ? null
            : MailBranding::newsletterUnsubscribeUrl($this->subscriber->unsubscribe_token);

        return new Content(
            view: 'mail.newsletter',
            with: [
                'mailSubject' => $this->campaign->subject,
                'body' => $this->campaign->body,
                'brandName' => $brand['name'],
                'tagline' => $brand['tagline'],
                'logoUrl' => $brand['logoUrl'],
                'logoWideUrl' => $brand['logoWideUrl'],
                'siteUrl' => $brand['siteUrl'],
                'accentColor' => $brand['accentColor'],
                'socialLinks' => $brand['socialLinks'],
                'unsubscribeUrl' => $unsubscribeUrl,
                'isTest' => $this->isTest,
            ],
        );
    }
}
