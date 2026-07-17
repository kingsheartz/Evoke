<?php

namespace Database\Seeders\Support;

final class DemoImages
{
    /** Stable placeholder photos (picsum.photos) — Unsplash hotlinks often 404 in production. */
    private static function url(string $theme, int $index, int $width = 900, int $height = 675): string
    {
        $seed = rawurlencode("evoke-{$theme}-{$index}");

        return "https://picsum.photos/seed/{$seed}/{$width}/{$height}";
    }

    public static function sports(int $index = 0): string
    {
        return self::url('sports', $index);
    }

    public static function academy(int $index = 0): string
    {
        return self::url('academy', $index);
    }

    public static function travel(int $index = 0): string
    {
        return self::url('travel', $index);
    }

    public static function person(int $index = 0): string
    {
        return self::url('person', $index, 400, 400);
    }

    /** @return list<string> */
    public static function gallery(string $theme, int $seed, int $count = 3): array
    {
        $normalized = match ($theme) {
            'sports', 'shop' => 'sports',
            'academy' => 'academy',
            'tours', 'travel' => 'travel',
            default => 'sports',
        };

        $items = [];
        for ($i = 0; $i < $count; $i++) {
            $items[] = self::url($normalized, $seed + $i);
        }

        return $items;
    }
}
