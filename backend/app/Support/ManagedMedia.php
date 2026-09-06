<?php

namespace App\Support;

class ManagedMedia
{
    /** @var list<string> */
    private const SCALAR_KEYS = [
        'image_url', 'image', 'logo_url', 'logo', 'thumbnail', 'photo',
        'hero_background_url', 'background_url', 'video_url', 'file_path', 'src',
    ];

    /** @var list<string> */
    private const LIST_KEYS = ['gallery', 'images', 'background_images', 'photos'];

    /** Delete storage objects present in $previous but not in $next. */
    public static function deleteRemoved(mixed $previous, mixed $next): void
    {
        $removed = array_diff(self::collect($previous), self::collect($next));

        foreach ($removed as $url) {
            MediaStorage::deleteManaged($url);
        }
    }

    /** @return list<string> */
    public static function collect(mixed $data): array
    {
        $urls = [];
        self::walk($data, $urls);

        return array_values(array_unique(array_filter($urls)));
    }

    /** @param list<string> $urls */
    private static function walk(mixed $data, array &$urls): void
    {
        if (! is_array($data)) {
            if (is_string($data) && self::looksLikeManagedUrl($data)) {
                $urls[] = $data;
            }

            return;
        }

        foreach ($data as $key => $value) {
            if (is_string($key) && in_array($key, self::SCALAR_KEYS, true) && is_string($value) && $value !== '') {
                if (self::looksLikeManagedUrl($value)) {
                    $urls[] = $value;
                }

                continue;
            }

            if (is_string($key) && in_array($key, self::LIST_KEYS, true) && is_array($value)) {
                foreach ($value as $item) {
                    if (is_string($item) && $item !== '' && self::looksLikeManagedUrl($item)) {
                        $urls[] = $item;
                    } elseif (is_array($item)) {
                        self::walk($item, $urls);
                    }
                }

                continue;
            }

            self::walk($value, $urls);
        }
    }

    private static function looksLikeManagedUrl(string $value): bool
    {
        if ($value === '') {
            return false;
        }

        if (! preg_match('#^https?://#i', $value)) {
            return str_starts_with($value, 'cms/')
                || str_starts_with($value, 'avatars/')
                || str_starts_with($value, 'academy/');
        }

        return MediaStorage::pathFromUrl($value) !== null;
    }
}
