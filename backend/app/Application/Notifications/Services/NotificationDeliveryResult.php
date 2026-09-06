<?php

namespace App\Application\Notifications\Services;

final class NotificationDeliveryResult
{
    private function __construct(
        public readonly string $status,
        public readonly ?string $errorMessage = null,
    ) {}

    public static function sent(): self
    {
        return new self('sent');
    }

    public static function skipped(string $reason): self
    {
        return new self('skipped', $reason);
    }

    public static function failed(string $reason): self
    {
        return new self('failed', $reason);
    }
}
