<?php

namespace App\Application\Notifications\Services;

use App\Mail\DomainNotificationMail;
use App\Models\DeviceToken;
use App\Models\User;
use App\Support\FirebaseMessaging;
use App\Support\MailDelivery;
use Illuminate\Support\Facades\Mail;

class NotificationChannelSender
{
    public function send(
        string $event,
        string $channel,
        ?int $userId,
        array $payload,
        ?string $templateBody,
        ?string $templateSubject,
    ): void {
        match ($channel) {
            'in_app' => $this->sendInApp($event, $userId, $payload),
            'email' => $this->sendEmail($event, $userId, $payload, $templateBody, $templateSubject),
            'push' => $this->sendPush($event, $userId, $payload, $templateBody, $templateSubject),
            default => null,
        };
    }

    private function sendInApp(string $event, ?int $userId, array $payload): void
    {
        if ($userId === null) {
            return;
        }

        User::find($userId)?->notify(new \App\Notifications\GenericInAppNotification($event, $payload));
    }

    private function sendEmail(
        string $event,
        ?int $userId,
        array $payload,
        ?string $templateBody,
        ?string $templateSubject,
    ): void {
        $recipient = $this->resolveEmailRecipient($userId, $payload);
        if ($recipient === null) {
            return;
        }

        $body = $this->renderTemplate($templateBody ?? 'Notification from Evoke.', $payload);
        $subject = $this->renderTemplate($templateSubject ?? 'Evoke notification', $payload);

        Mail::mailer(MailDelivery::defaultMailer())
            ->to($recipient)
            ->send(new DomainNotificationMail($subject, $body));
    }

    private function sendPush(
        string $event,
        ?int $userId,
        array $payload,
        ?string $templateBody,
        ?string $templateSubject,
    ): void {
        if ($userId === null) {
            return;
        }

        $messaging = app(FirebaseMessaging::class);
        if (! $messaging->configured()) {
            return;
        }

        $tokens = DeviceToken::query()
            ->where('user_id', $userId)
            ->orderByDesc('last_used_at')
            ->get()
            ->unique('platform')
            ->pluck('token');

        if ($tokens->isEmpty()) {
            return;
        }

        $title = $this->renderTemplate($templateSubject ?? 'Evoke', $payload);
        $body = $this->renderTemplate($templateBody ?? 'You have a new notification.', $payload);
        $data = [
            'event' => $event,
            ...collect($payload)
                ->filter(fn ($value) => is_scalar($value))
                ->mapWithKeys(fn ($value, $key) => [(string) $key => (string) $value])
                ->all(),
        ];

        foreach ($tokens as $token) {
            if ($messaging->sendToDevice($token, $title, $body, $data) === 'invalid_token') {
                DeviceToken::query()->where('token', $token)->delete();
            }
        }
    }

    /** @param array<string, mixed> $payload */
    private function resolveEmailRecipient(?int $userId, array $payload): ?string
    {
        if ($userId !== null) {
            return User::find($userId)?->email;
        }

        $email = $payload['email'] ?? null;

        return is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    /** @param array<string, mixed> $payload */
    private function renderTemplate(string $template, array $payload): string
    {
        $rendered = $template;
        foreach ($payload as $key => $value) {
            if (is_scalar($value)) {
                $rendered = str_replace('{{'.$key.'}}', (string) $value, $rendered);
            }
        }

        return $rendered;
    }
}
