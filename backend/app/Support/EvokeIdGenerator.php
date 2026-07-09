<?php

namespace App\Support;

use App\Models\User;

class EvokeIdGenerator
{
    public static function generate(): string
    {
        $year = now()->format('Y');
        $latest = User::withTrashed()
            ->where('evoke_id', 'like', "EVK-{$year}-%")
            ->orderByDesc('evoke_id')
            ->value('evoke_id');

        $sequence = 1;
        if ($latest && preg_match('/EVK-\d{4}-(\d+)/', $latest, $matches)) {
            $sequence = ((int) $matches[1]) + 1;
        }

        return sprintf('EVK-%s-%05d', $year, $sequence);
    }
}
