<?php

namespace App\Application\Notifications\Services;

use App\Models\User;
use App\Support\NotificationTemplateDefaults;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationDispatcher
{
    public function __construct(
        private readonly NotificationChannelSender $sender,
    ) {}

    /** @param array<string> $channels */
    public function dispatch(string $event, ?User $user, array $payload, array $channels = ['in_app', 'email', 'push']): void
    {
        foreach ($channels as $channel) {
            $template = DB::table('notification_templates')
                ->where('event', $event)
                ->where('channel', $channel)
                ->where('is_active', true)
                ->first();

            $fallback = NotificationTemplateDefaults::for($event, $channel);
            $body = $template?->body;
            $subject = $template?->subject;
            if ($fallback !== null) {
                $body ??= $fallback['body'];
                $subject ??= $fallback['subject'];
            }

            if ($body === null && $channel !== 'in_app') {
                continue;
            }

            $logId = DB::table('notification_logs')->insertGetId([
                'user_id' => $user?->id,
                'event' => $event,
                'channel' => $channel,
                'recipient' => $user?->email ?? ($payload['email'] ?? 'system'),
                'status' => 'pending',
                'payload' => json_encode($payload),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            try {
                $this->sender->send($event, $channel, $user?->id, $payload, $body, $subject);

                DB::table('notification_logs')->where('id', $logId)->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {
                Log::error('Notification delivery failed', [
                    'event' => $event,
                    'channel' => $channel,
                    'user_id' => $user?->id,
                    'error' => $e->getMessage(),
                ]);

                DB::table('notification_logs')->where('id', $logId)->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
