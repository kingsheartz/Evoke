<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Evoke Platform API',
        'version' => 'v1',
        'health' => url('/api/v1/health'),
        'documentation' => url('/docs/api'),
        'openapi' => url('/docs/api.json'),
    ]);
});
