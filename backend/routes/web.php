<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Evoke Platform API',
        'version' => 'v1',
        'docs' => '/api/v1/health',
    ]);
});
