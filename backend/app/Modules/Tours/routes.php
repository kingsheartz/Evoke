<?php

use App\Http\Controllers\Api\V1\Tours\PackageController;
use App\Http\Controllers\Api\V1\Tours\BookingController;
use App\Http\Controllers\Api\V1\Tours\EnquiryController;
use Illuminate\Support\Facades\Route;

Route::prefix('tours')->middleware(['module.enabled:tours'])->group(function () {
    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{slug}', [PackageController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings', [BookingController::class, 'index']);
    });

    Route::post('/enquiries', [EnquiryController::class, 'store']);

    Route::middleware(['auth:sanctum', 'permission:tours.packages.manage'])->group(function () {
        Route::post('/packages', [PackageController::class, 'store']);
        Route::put('/packages/{package}', [PackageController::class, 'update']);
    });
});
