<?php

$normalizeOrigin = static function (?string $origin): ?string {
    $origin = trim((string) $origin);

    if ($origin === '') {
        return null;
    }

    return rtrim($origin, '/');
};

$splitOrigins = static function (?string $value) use ($normalizeOrigin): array {
    if ($value === null || trim($value) === '') {
        return [];
    }

    return array_values(array_filter(array_map(
        $normalizeOrigin,
        explode(',', $value),
    )));
};

$extraOrigins = $splitOrigins(env('CORS_ALLOWED_ORIGINS', ''));
$frontendOrigins = $splitOrigins(env('FRONTEND_URL', 'http://localhost:3000'));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_filter(array_merge(
        [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ],
        $frontendOrigins,
        $extraOrigins,
    )))),
    'allowed_origins_patterns' => array_values(array_filter([
        env('CORS_ALLOWED_ORIGIN_PATTERN') ?: null,
        '#^https://([a-z0-9-]+\.)*vercel\.app$#',
    ])),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
