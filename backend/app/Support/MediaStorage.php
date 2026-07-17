<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class MediaStorage
{
    /** Disk used for user-facing uploads (CMS, avatars, certificates). */
    public static function uploadDisk(): string
    {
        $default = config('filesystems.default', 'local');

        return $default === 's3' ? 's3' : 'public';
    }

    public static function url(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        return Storage::disk(self::uploadDisk())->url($path);
    }

    public static function delete(?string $path): void
    {
        if ($path === null || $path === '' || preg_match('#^https?://#i', $path)) {
            return;
        }

        Storage::disk(self::uploadDisk())->delete($path);
    }
}
