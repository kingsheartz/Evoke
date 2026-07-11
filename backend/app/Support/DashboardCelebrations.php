<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Carbon;

class DashboardCelebrations
{
    /**
     * @return array{birthdays: list<array<string, mixed>>, anniversaries: list<array<string, mixed>>}
     */
    public static function today(): array
    {
        $today = Carbon::today();
        $month = $today->month;
        $day = $today->day;

        $birthdays = User::query()
            ->whereNotNull('date_of_birth')
            ->whereMonth('date_of_birth', $month)
            ->whereDay('date_of_birth', $day)
            ->orderBy('name')
            ->get(['id', 'name', 'date_of_birth', 'avatar'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'type' => 'birthday',
                'date' => Carbon::parse($user->date_of_birth)->toDateString(),
                'age' => Carbon::parse($user->date_of_birth)->age,
                'avatar_url' => $user->avatar_url,
            ])
            ->values()
            ->all();

        $anniversaries = User::query()
            ->whereMonth('created_at', $month)
            ->whereDay('created_at', $day)
            ->whereYear('created_at', '<', $today->year)
            ->orderBy('name')
            ->get(['id', 'name', 'created_at', 'avatar'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'type' => 'anniversary',
                'date' => $user->created_at?->toDateString(),
                'years' => $user->created_at ? $today->year - $user->created_at->year : null,
                'avatar_url' => $user->avatar_url,
            ])
            ->values()
            ->all();

        return [
            'birthdays' => $birthdays,
            'anniversaries' => $anniversaries,
        ];
    }
}
