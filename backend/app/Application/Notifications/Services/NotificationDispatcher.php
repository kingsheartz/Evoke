<?php

namespace App\Application\Notifications\Services;

use App\Jobs\Notifications\SendNotificationJob;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NotificationDispatcher
{
    /** @param array<string> $channels */
    public function dispatch(string $event, ?User $user, array $payload, array $channels = ['in_app', 'email']): void
    {
        foreach ($channels as $channel) {
            $template = DB::table('notification_templates')
                ->where('event', $event)
                ->where('channel', $channel)
                ->where('is_active', true)
                ->first();

            if (! $template && $channel !== 'in_app') {
                continue;
            }

            SendNotificationJob::dispatch($event, $channel, $user?->id, $payload, $template?->body);

            DB::table('notification_logs')->insert([
                'user_id' => $user?->id,
                'event' => $event,
                'channel' => $channel,
                'recipient' => $user?->email ?? ($payload['email'] ?? 'system'),
                'status' => 'queued',
                'payload' => json_encode($payload),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
