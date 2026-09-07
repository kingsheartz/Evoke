<?php

namespace App\Application\Newsletter\Services;

use App\Mail\NewsletterMail;
use App\Models\Newsletter\NewsletterCampaign;
use App\Models\Newsletter\NewsletterSubscriber;
use App\Support\MailDelivery;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NewsletterSender
{
    /** @return array{sent: int, failed: int} */
    public function sendCampaign(NewsletterCampaign $campaign): array
    {
        if (! MailDelivery::isNewsletterDeliverable()) {
            throw new \RuntimeException('Newsletter mail is not configured. Set SMTP credentials or another deliverable mailer.');
        }

        $campaign->update(['status' => 'sending']);

        return $this->deliverCampaign($campaign);
    }

    /** Send to all active subscribers; campaign should already be in sending status. */
    public function deliverCampaign(NewsletterCampaign $campaign): array
    {
        if (! MailDelivery::isNewsletterDeliverable()) {
            $campaign->update(['status' => 'failed', 'failed_count' => 1]);

            throw new \RuntimeException('Newsletter mail is not configured. Set SMTP credentials or another deliverable mailer.');
        }

        MailDelivery::assertNewsletterTransportReady();

        $sent = 0;
        $failed = 0;
        $mailer = MailDelivery::newsletterMailer();

        try {
            NewsletterSubscriber::query()
                ->where('status', 'active')
                ->orderBy('id')
                ->chunkById(100, function ($subscribers) use ($campaign, $mailer, &$sent, &$failed): void {
                    foreach ($subscribers as $subscriber) {
                        try {
                            Mail::mailer($mailer)
                                ->to($subscriber->email)
                                ->send(new NewsletterMail($campaign, $subscriber));

                            $sent++;
                        } catch (\Throwable $e) {
                            $failed++;
                            Log::warning('Newsletter send failed', [
                                'campaign_id' => $campaign->id,
                                'subscriber_id' => $subscriber->id,
                                'email' => $subscriber->email,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                });

            $campaign->update([
                'status' => $failed > 0 && $sent === 0 ? 'failed' : 'sent',
                'sent_count' => $sent,
                'failed_count' => $failed,
                'sent_at' => now(),
            ]);

            return ['sent' => $sent, 'failed' => $failed];
        } catch (\Throwable $e) {
            $campaign->update([
                'status' => 'failed',
                'failed_count' => max($failed, 1),
            ]);

            Log::error('Newsletter campaign send aborted', [
                'campaign_id' => $campaign->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function sendTest(NewsletterCampaign $campaign, string $email): void
    {
        if (! MailDelivery::isNewsletterDeliverable()) {
            throw new \RuntimeException('Newsletter mail is not configured. Set SMTP credentials or another deliverable mailer.');
        }

        MailDelivery::assertNewsletterTransportReady();

        $subscriber = new NewsletterSubscriber([
            'email' => strtolower(trim($email)),
            'unsubscribe_token' => '00000000-0000-0000-0000-000000000000',
            'status' => 'active',
        ]);

        Mail::mailer(MailDelivery::newsletterMailer())
            ->to($subscriber->email)
            ->send(new NewsletterMail($campaign, $subscriber, isTest: true));
    }
}
