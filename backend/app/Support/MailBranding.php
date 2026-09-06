<?php

namespace App\Support;

use App\Models\Shop\Order;
use Illuminate\Support\Facades\DB;

class MailBranding
{
    /** @return array{name: string, tagline: string|null, logoUrl: string|null, logoWideUrl: string|null, siteUrl: string|null, accentColor: string, socialLinks: array<int, array{platform: string, url: string, label: string, iconUrl: string}>} */
    public static function resolve(): array
    {
        $siteUrl = self::siteUrl();
        $override = self::brandOverride();
        $defaults = self::defaultLogos();

        $name = config('mail.from.name')
            ?: ($override['name'] ?? null)
            ?: config('app.name', 'Evoke');

        $tagline = trim((string) ($override['tagline'] ?? '')) ?: null;

        $icon = self::absoluteUrl($override['logos']['icon'] ?? null) ?? self::absoluteUrl($defaults['icon']);
        $horizontal = self::absoluteUrl($override['logos']['horizontal'] ?? null) ?? self::absoluteUrl($defaults['horizontal']);

        return [
            'name' => (string) $name,
            'tagline' => $tagline,
            'logoUrl' => $icon,
            'logoWideUrl' => $horizontal ?: $icon,
            'siteUrl' => $siteUrl,
            'accentColor' => '#6366f1',
            'socialLinks' => self::socialLinksForEmail($override, $siteUrl),
        ];
    }

    public static function newsletterUnsubscribeUrl(string $token): ?string
    {
        $siteUrl = self::siteUrl();

        return $siteUrl !== null ? $siteUrl.'/newsletter/unsubscribe?token='.urlencode($token) : null;
    }

    /**
     * Social profile links for email footers (Instagram only for now).
     *
     * @param  array<string, mixed>  $brandOverride
     * @return array<int, array{platform: string, url: string, label: string, iconUrl: string}>
     */
    public static function socialLinksForEmail(array $brandOverride, ?string $siteUrl): array
    {
        $links = [];
        $components = $brandOverride['header']['components'] ?? [];

        if (! is_array($components)) {
            return $links;
        }

        foreach ($components as $component) {
            if (! is_array($component) || ($component['type'] ?? '') !== 'social_links') {
                continue;
            }

            if (($component['enabled'] ?? true) === false) {
                continue;
            }

            $social = $component['social'] ?? [];
            if (! is_array($social)) {
                continue;
            }

            foreach ($social as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $platform = strtolower(trim((string) ($item['platform'] ?? '')));
                $url = trim((string) ($item['url'] ?? ''));

                if ($platform !== 'instagram' || $url === '') {
                    continue;
                }

                $links[] = [
                    'platform' => 'instagram',
                    'url' => $url,
                    'label' => trim((string) ($item['label'] ?? 'Instagram')) ?: 'Instagram',
                    'iconUrl' => self::socialIconUrl('instagram', $siteUrl),
                ];
            }
        }

        if ($links === []) {
            $links[] = [
                'platform' => 'instagram',
                'url' => self::defaultInstagramUrl(),
                'label' => 'Instagram',
                'iconUrl' => self::socialIconUrl('instagram', $siteUrl),
            ];
        }

        return $links;
    }

    private static function defaultInstagramUrl(): string
    {
        return 'https://www.instagram.com/eokegroup/';
    }

    private static function socialIconUrl(string $platform, ?string $siteUrl): string
    {
        if ($siteUrl !== null) {
            return $siteUrl.'/social/'.$platform.'-email.png';
        }

        return match ($platform) {
            'instagram' => 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
            default => '',
        };
    }

    /** Optional hero image for the email body (product photo, uploaded image, etc.). */
    public static function contextImageFor(string $event, array $payload): ?string
    {
        $explicit = $payload['image_url'] ?? $payload['image'] ?? null;
        if (is_string($explicit) && $explicit !== '') {
            return self::absoluteMediaUrl($explicit);
        }

        if (str_starts_with($event, 'order.') || $event === 'payment.success') {
            return self::orderProductImage($payload);
        }

        return null;
    }

    /** @return array{label: string, url: string}|null */
    public static function actionFor(string $event, array $payload): ?array
    {
        $siteUrl = self::siteUrl();
        if ($siteUrl === null) {
            return null;
        }

        if (isset($payload['order_id']) && (str_starts_with($event, 'order.') || $event === 'payment.success')) {
            return [
                'label' => 'View order',
                'url' => $siteUrl.'/account/orders/'.(int) $payload['order_id'],
            ];
        }

        if ($event === 'course.enrollment' || $event === 'enrollment.status_updated') {
            return ['label' => 'My enrollments', 'url' => $siteUrl.'/account/enrollments'];
        }

        if (str_starts_with($event, 'booking.')) {
            return ['label' => 'My bookings', 'url' => $siteUrl.'/account/bookings'];
        }

        if ($event === 'certificate.issued') {
            return ['label' => 'My certificates', 'url' => $siteUrl.'/account/certificates'];
        }

        return ['label' => 'Open Evoke', 'url' => $siteUrl.'/account/notifications'];
    }

    /** @param array<string, mixed> $payload */
    private static function orderProductImage(array $payload): ?string
    {
        $order = null;
        if (isset($payload['order_id'])) {
            $order = Order::query()->with(['items.product'])->find((int) $payload['order_id']);
        } elseif (isset($payload['order_number']) && is_string($payload['order_number'])) {
            $order = Order::query()->with(['items.product'])->where('order_number', $payload['order_number'])->first();
        }

        if ($order === null) {
            return null;
        }

        foreach ($order->items as $item) {
            $images = $item->product?->images;
            if (! is_array($images)) {
                continue;
            }

            foreach ($images as $image) {
                $url = self::absoluteMediaUrl(is_string($image) ? $image : null);
                if ($url !== null) {
                    return $url;
                }
            }
        }

        return null;
    }

    /** @return array<string, mixed> */
    private static function brandOverride(): array
    {
        $row = DB::table('platform_settings')->where('key', 'brand')->first();
        if ($row === null) {
            return [];
        }

        $decoded = json_decode($row->value, true);

        return is_array($decoded) ? $decoded : [];
    }

    /** @return array{icon: string, horizontal: string} */
    private static function defaultLogos(): array
    {
        return [
            'icon' => '/logo-icon.png',
            'horizontal' => '/logo-hr-dark.png',
        ];
    }

    private static function siteUrl(): ?string
    {
        $url = rtrim((string) env('FRONTEND_URL', config('app.url')), '/');

        return $url !== '' ? $url : null;
    }

    private static function absoluteUrl(?string $pathOrUrl): ?string
    {
        if ($pathOrUrl === null || trim($pathOrUrl) === '') {
            return null;
        }

        if (preg_match('#^https?://#i', $pathOrUrl)) {
            return $pathOrUrl;
        }

        $siteUrl = self::siteUrl();

        return $siteUrl !== null ? $siteUrl.'/'.ltrim($pathOrUrl, '/') : null;
    }

    private static function absoluteMediaUrl(?string $pathOrUrl): ?string
    {
        if ($pathOrUrl === null || trim($pathOrUrl) === '') {
            return null;
        }

        if (preg_match('#^https?://#i', $pathOrUrl)) {
            return $pathOrUrl;
        }

        return MediaStorage::url($pathOrUrl) ?? self::absoluteUrl($pathOrUrl);
    }
}
