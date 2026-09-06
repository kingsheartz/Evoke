<?php

namespace App\Support;

use App\Models\DeviceToken;
use Illuminate\Support\Collection;

class DeviceTokenSelection
{
    /** Latest FCM token per platform for a user (avoids duplicate push). */
    public static function latestPerPlatform(int $userId): Collection
    {
        return DeviceToken::query()
            ->where('user_id', $userId)
            ->orderByDesc('last_used_at')
            ->get()
            ->unique(fn (DeviceToken $row) => $row->platform.'|'.$row->token)
            ->unique('platform')
            ->pluck('token');
    }
}
