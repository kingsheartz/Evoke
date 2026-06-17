<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GenericInAppNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $event,
        public array $payload,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'event' => $this->event,
            'payload' => $this->payload,
        ];
    }
}
