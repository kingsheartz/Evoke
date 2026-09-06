<?php

namespace App\Application\Notifications\Services;

use App\Mail\DomainNotificationMail;
use App\Models\DeviceToken;
use App\Models\User;
use App\Support\FirebaseMessaging;
use App\Support\MailDelivery;
use Illuminate\Support\Facades\Log;
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
    ): NotificationDeliveryResult {
        return match ($channel) {
            'in_app' => $this->sendInApp($event, $userId, $payload),
            'email' => $this->sendEmail($event, $userId, $payload, $templateBody, $templateSubject),
            'push' => $this->sendPush($event, $userId, $payload, $templateBody, $templateSubject),
            default => NotificationDeliveryResult::skipped("Unknown channel: {$channel}"),
        };
    }

    private function sendInApp(string $event, ?int $userId, array $payload): NotificationDeliveryResult
    {
        if ($userId === null) {
            return NotificationDeliveryResult::skipped('No user for in-app notification');
        }

        $user = User::find($userId);
        if ($user === null) {
            return NotificationDeliveryResult::skipped('User not found');
        }

        $user->notify(new \App\Notifications\GenericInAppNotification($event, $payload));

        return NotificationDeliveryResult::sent();
    }

    private function sendEmail(
        string $event,
        ?int $userId,
        array $payload,
        ?string $templateBody,
        ?string $templateSubject,
    ): NotificationDeliveryResult {
        $recipient = $this->resolveEmailRecipient($userId, $payload);
        if ($recipient === null) {
            return NotificationDeliveryResult::skipped('No email recipient');
        }

        if (! MailDelivery::isDeliverable()) {
            return NotificationDeliveryResult::failed(
                'Mail is not configured for delivery (check RESEND_API_KEY or SMTP on Render)',
            );
        }

        $body = $this->renderTemplate($templateBody ?? 'Notification from Evoke.', $payload);
        $subject = $this->renderTemplate($templateSubject ?? 'Evoke notification', $payload);

        try {
            Mail::mailer(MailDelivery::defaultMailer())
                ->to($recipient)
                ->send(new DomainNotificationMail($subject, $body));
        } catch (\Throwable $e) {
            Log::error('Email notification failed', [
                'event' => $event,
                'recipient' => $recipient,
                'mailer' => MailDelivery::defaultMailer(),
                'error' => $e->getMessage(),
            ]);

            return NotificationDeliveryResult::failed($e->getMessage());
        }

        return NotificationDeliveryResult::sent();
    }

    private function sendPush(
        string $event,
        ?int $userId,
        array $payload,
        ?string $templateBody,
        ?string $templateSubject,
    ): NotificationDeliveryResult {
        if ($userId === null) {
            return NotificationDeliveryResult::skipped('No user for push notification');
        }

        $messaging = app(FirebaseMessaging::class);
        if (! $messaging->configured()) {
            return NotificationDeliveryResult::skipped('Firebase not configured on server');
        }

        $tokens = DeviceToken::query()
            ->where('user_id', $userId)
            ->orderByDesc('last_used_at')
            ->get()
            ->unique('platform')
            ->pluck('token');

        if ($tokens->isEmpty()) {
            return NotificationDeliveryResult::skipped('No device tokens registered for user');
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

        $sent = 0;
        $failed = 0;

        foreach ($tokens as $token) {
            $result = $messaging->sendToDevice($token, $title, $body, $data);

            if ($result === 'sent') {
                $sent++;
            } else {
                $failed++;
                if ($result === 'invalid_token') {
                    DeviceToken::query()->where('token', $token)->delete();
                }
            }
        }

        if ($sent === 0) {
            return NotificationDeliveryResult::failed(
                $failed > 0
                    ? 'FCM rejected all device tokens'
                    : 'FCM delivery failed',
            );
        }

        return NotificationDeliveryResult::sent();
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
