<?php

use Dedoc\Scramble\Http\Middleware\RestrictedDocsAccess;
use Dedoc\Scramble\SecurityDocumentation\MiddlewareAuthSecurityStrategy;
use Dedoc\Scramble\Support\Generator\SecurityScheme;

return [
    'api_path' => 'api/v1',

    'api_domain' => null,

    'export_path' => 'api/v1/openapi.json',

    'cache' => [
        'key' => 'scramble.openapi',
        'store' => env('SCRAMBLE_CACHE_STORE', 'file'),
    ],

    'info' => [
        'version' => env('API_VERSION', 'v1'),
        'description' => <<<'MD'
Evoke Platform REST API — multi-business modular monolith.

**Base URL:** `/api/v1`

**Authentication:** Laravel Sanctum bearer token. Obtain a token via `POST /api/v1/auth/login` or `POST /api/v1/auth/register`, then send `Authorization: Bearer {token}` on protected routes.

**Modules:** Academy, Shop, Tours, CMS, Notifications, and Admin routes may require the corresponding business module to be enabled.

**Permissions:** Admin routes use Spatie permission middleware (`permission:*`). Your token must belong to a user with the required role/permission.
MD,
    ],

    'ui' => [
        'title' => 'Evoke Platform API',
    ],

    'renderer' => 'elements',

    'renderers' => [
        'elements' => [
            'view' => 'scramble::docs',
            'theme' => 'dark',
            'hideTryIt' => false,
            'hideSchemas' => false,
            'logo' => '',
            'tryItCredentialsPolicy' => 'include',
            'layout' => 'responsive',
            'router' => 'hash',
        ],
        'scalar' => [
            'view' => 'scramble::scalar',
            'cdn' => 'https://cdn.jsdelivr.net/npm/@scalar/api-reference',
            'theme' => 'laravel',
            'proxyUrl' => 'https://proxy.scalar.com',
            'darkMode' => true,
            'showDeveloperTools' => 'never',
            'agent' => ['disabled' => true],
            'credentials' => 'include',
        ],
    ],

    'servers' => null,

    'enum_cases_description_strategy' => 'description',
    'enum_cases_names_strategy' => false,
    'flatten_deep_query_parameters' => true,

    'middleware' => [
        'web',
        RestrictedDocsAccess::class,
    ],

    'extensions' => [],

    'security_strategy' => [
        MiddlewareAuthSecurityStrategy::class,
        [
            'middleware' => ['auth:sanctum'],
            'scheme' => SecurityScheme::http('bearer', 'Sanctum'),
        ],
    ],
];
