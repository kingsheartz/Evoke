<?php

use App\Http\Controllers\Api\V1\CMS\DivisionPageController;
use App\Http\Controllers\Api\V1\CMS\HomepageAdminController;
use App\Http\Controllers\Api\V1\CMS\MediaController;
use App\Http\Controllers\Api\V1\CMS\PageController;
use App\Http\Controllers\Api\V1\CMS\PageSectionController;
use Illuminate\Support\Facades\Route;

Route::prefix('cms')->middleware(['module.enabled:cms'])->group(function () {
    Route::get('/pages', [PageController::class, 'index']);
    Route::get('/pages/{slug}', [PageController::class, 'show']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/media', [MediaController::class, 'store']);
    });

    Route::middleware(['auth:sanctum', 'permission:cms.homepage.manage'])->group(function () {
        Route::put('/homepage', [HomepageAdminController::class, 'update']);
        Route::get('/admin/divisions', [DivisionPageController::class, 'adminIndex']);
        Route::post('/admin/divisions', [DivisionPageController::class, 'store']);
        Route::get('/admin/divisions/{slug}', [DivisionPageController::class, 'adminShow']);
        Route::put('/admin/divisions/{slug}', [DivisionPageController::class, 'update']);
        Route::delete('/admin/divisions/{slug}', [DivisionPageController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'permission:cms.pages.manage'])->group(function () {
        Route::get('/admin/pages', [PageController::class, 'adminIndex']);
        Route::get('/admin/pages/{page}', [PageController::class, 'adminShow']);
        Route::post('/pages', [PageController::class, 'store']);
        Route::post('/admin/pages/{page}/duplicate', [PageController::class, 'duplicate']);
        Route::put('/pages/{page}', [PageController::class, 'update']);
        Route::delete('/pages/{page}', [PageController::class, 'destroy']);
        Route::post('/admin/pages/{page}/sections', [PageSectionController::class, 'store']);
        Route::post('/admin/pages/{page}/sections/{section}/duplicate', [PageSectionController::class, 'duplicate'])->whereNumber('section');
        Route::put('/admin/pages/{page}/sections/reorder', [PageSectionController::class, 'reorder']);
        Route::put('/admin/pages/{page}/sections/{section}', [PageSectionController::class, 'update'])->whereNumber('section');
        Route::delete('/admin/pages/{page}/sections/{section}', [PageSectionController::class, 'destroy'])->whereNumber('section');
    });
});
