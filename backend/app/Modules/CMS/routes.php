<?php

use App\Http\Controllers\Api\V1\CMS\PageController;
use App\Http\Controllers\Api\V1\CMS\HomepageAdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('cms')->middleware(['module.enabled:cms'])->group(function () {
    Route::get('/pages', [PageController::class, 'index']);
    Route::get('/pages/{slug}', [PageController::class, 'show']);

    Route::middleware(['auth:sanctum', 'permission:cms.pages.manage'])->group(function () {
        Route::post('/pages', [PageController::class, 'store']);
        Route::put('/pages/{page}', [PageController::class, 'update']);
        Route::delete('/pages/{page}', [PageController::class, 'destroy']);
        Route::put('/homepage', [HomepageAdminController::class, 'update']);
    });
});
