<?php

namespace App\Support;

class StoragePaths
{
    /** Ensure Laravel cache/view/session directories exist (Render Docker). */
    public static function ensureFrameworkDirectories(): void
    {
        foreach ([
            storage_path('framework/cache/data'),
            storage_path('framework/views'),
            storage_path('framework/sessions'),
            storage_path('logs'),
            base_path('bootstrap/cache'),
        ] as $path) {
            if (is_dir($path)) {
                continue;
            }

            mkdir($path, 0775, true);
        }
    }
}
