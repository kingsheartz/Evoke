<?php

use App\Http\Controllers\Api\V1\CMS\PageSectionController;
use App\Http\Controllers\Api\V1\CMS\PageController;
use App\Http\Controllers\Api\V1\CMS\HomepageAdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('cms')->middleware(['module.enabled:cms'])->group(function () {
    Route::get('/pages', [PageController::class, 'index']);
    Route::get('/pages/{slug}', [PageController::class, 'show']);

    Route::middleware(['auth:sanctum', 'permission:cms.homepage.manage'])->group(function () {
        Route::put('/homepage', [HomepageAdminController::class, 'update']);
    });

    Route::middleware(['auth:sanctum', 'permission:cms.pages.manage'])->group(function () {
        Route::get('/admin/pages', [PageController::class, 'adminIndex']);
        Route::get('/admin/pages/{page}', [PageController::class, 'adminShow']);
        Route::post('/pages', [PageController::class, 'store']);
        Route::put('/pages/{page}', [PageController::class, 'update']);
        Route::delete('/pages/{page}', [PageController::class, 'destroy']);
        Route::post('/admin/pages/{page}/sections', [PageSectionController::class, 'store']);
        Route::put('/admin/pages/{page}/sections/{section}', [PageSectionController::class, 'update']);
        Route::delete('/admin/pages/{page}/sections/{section}', [PageSectionController::class, 'destroy']);
        Route::put('/admin/pages/{page}/sections/reorder', [PageSectionController::class, 'reorder']);
    });
});
