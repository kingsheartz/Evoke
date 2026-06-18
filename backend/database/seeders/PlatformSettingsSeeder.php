<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'admin_preferences' => [
                'notifications' => [
                    'enabled' => true,
                    'position' => 'top-right',
                    'defaultDurationMs' => 5000,
                    'showProgressBar' => true,
                    'showCountdown' => false,
                ],
                'hotkeys' => [
                    'save' => 'mod+s',
                    'search' => 'mod+k',
                    'help' => 'shift+/',
                    'hotkeys' => 'mod+/',
                    'new' => 'mod+n',
                    'close' => 'escape',
                    'sidebar' => 'mod+b',
                ],
                'tour' => [
                    'autoStart' => false,
                ],
                'theme' => [
                    'mode' => 'dark',
                    'accent' => 'violet',
                ],
            ],
            'advertisements' => [],
        ];

        foreach ($defaults as $key => $value) {
            DB::table('platform_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => json_encode($value), 'updated_at' => now()],
            );
        }
    }
}
