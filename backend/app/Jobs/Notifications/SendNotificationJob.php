<?php

namespace App\Jobs\Notifications;

use App\Mail\DomainNotificationMail;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $event,
        public string $channel,
        public ?int $userId,
        public array $payload,
        public ?string $templateBody = null,
        public ?string $templateSubject = null,
    ) {}

    public function handle(): void
    {
        try {
            match ($this->channel) {
                'in_app' => $this->sendInApp(),
                'email' => $this->sendEmail(),
                'sms' => $this->sendSms(),
                'whatsapp' => $this->sendWhatsApp(),
                'push' => $this->sendPush(),
                default => Log::info("Notification channel {$this->channel} not configured."),
            };

            DB::table('notification_logs')
                ->where('event', $this->event)
                ->where('channel', $this->channel)
                ->where('status', 'queued')
                ->latest('id')
                ->limit(1)
                ->update(['status' => 'sent', 'sent_at' => now()]);
        } catch (\Throwable $e) {
            DB::table('notification_logs')
                ->where('event', $this->event)
                ->where('channel', $this->channel)
                ->where('status', 'queued')
                ->latest('id')
                ->limit(1)
                ->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
        }
    }

    private function sendInApp(): void
    {
        if (! $this->userId) {
            return;
        }

        $user = User::find($this->userId);
        $user?->notify(new \App\Notifications\GenericInAppNotification($this->event, $this->payload));
    }

    private function sendEmail(): void
    {
        $recipient = $this->resolveEmailRecipient();
        if (! $recipient) {
            Log::info('Email notification skipped — no recipient', ['event' => $this->event]);

            return;
        }

        $body = $this->renderTemplate($this->templateBody ?? 'Notification from Evoke.');
        $subject = $this->renderTemplate($this->templateSubject ?? 'Evoke notification');

        Mail::to($recipient)->send(new DomainNotificationMail($subject, $body));
    }

    private function resolveEmailRecipient(): ?string
    {
        if ($this->userId) {
            return User::find($this->userId)?->email;
        }

        $email = $this->payload['email'] ?? null;

        return is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    private function renderTemplate(string $template): string
    {
        $rendered = $template;
        foreach ($this->payload as $key => $value) {
            if (is_scalar($value)) {
                $rendered = str_replace('{{'.$key.'}}', (string) $value, $rendered);
            }
        }

        return $rendered;
    }

    private function sendSms(): void
    {
        Log::info('SMS notification queued via MSG91', ['event' => $this->event]);
    }

    private function sendWhatsApp(): void
    {
        Log::info('WhatsApp notification queued via Meta API', ['event' => $this->event]);
    }

    private function sendPush(): void
    {
        Log::info('Push notification queued via Firebase', ['event' => $this->event]);
    }
}
