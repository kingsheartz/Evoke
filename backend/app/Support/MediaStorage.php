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
        self::deleteManaged($path);
    }

    /** Delete a storage path or a URL that belongs to this app's upload bucket. */
    public static function deleteManaged(?string $pathOrUrl): void
    {
        if ($pathOrUrl === null || $pathOrUrl === '') {
            return;
        }

        $path = preg_match('#^https?://#i', $pathOrUrl)
            ? self::pathFromUrl($pathOrUrl)
            : ltrim($pathOrUrl, '/');

        if ($path === null || $path === '') {
            return;
        }

        Storage::disk(self::uploadDisk())->delete($path);
    }

    public static function pathFromUrl(string $url): ?string
    {
        if (! preg_match('#^https?://#i', $url)) {
            return ltrim($url, '/');
        }

        $bases = array_values(array_filter(array_unique([
            config('filesystems.disks.s3.url'),
            env('AWS_URL'),
            rtrim((string) config('app.url'), '/').'/storage',
            env('NEXT_PUBLIC_MEDIA_BASE_URL'),
        ])));

        foreach ($bases as $base) {
            $base = rtrim((string) $base, '/');
            if ($base !== '' && str_starts_with($url, $base.'/')) {
                return ltrim(substr($url, strlen($base)), '/');
            }
        }

        if (preg_match('#/(cms/(?:images|videos)/[^?#]+)#', $url, $matches)) {
            return $matches[1];
        }

        if (preg_match('#/(avatars/[^?#]+)#', $url, $matches)) {
            return $matches[1];
        }

        if (preg_match('#/(academy/[^?#]+)#', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
