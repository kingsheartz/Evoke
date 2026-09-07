<?php

namespace App\Jobs;

use App\Application\Newsletter\Services\NewsletterSender;
use App\Models\Newsletter\NewsletterCampaign;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** Runs after the HTTP response so send status can update without request timeouts. */
class SendNewsletterCampaignJob
{
    use Dispatchable, Queueable, SerializesModels;

    public function __construct(public NewsletterCampaign $campaign) {}

    public function handle(NewsletterSender $sender): void
    {
        $sender->deliverCampaign($this->campaign->fresh());
    }
}
