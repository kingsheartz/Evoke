<?php

namespace App\Jobs;

use App\Application\Newsletter\Services\NewsletterSender;
use App\Models\Newsletter\NewsletterCampaign;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendNewsletterTestJob
{
    use Dispatchable, Queueable, SerializesModels;

    public function __construct(
        public NewsletterCampaign $campaign,
        public string $email,
    ) {}

    public function handle(NewsletterSender $sender): void
    {
        try {
            $sender->sendTest($this->campaign->fresh(), $this->email);
        } catch (\Throwable $e) {
            Log::error('Newsletter test send failed', [
                'campaign_id' => $this->campaign->id,
                'email' => $this->email,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
