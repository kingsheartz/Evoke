<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\ProfileController;
use App\Http\Controllers\Api\V1\Admin\PlatformSettingsController;
use App\Http\Controllers\Api\V1\CMS\DivisionPageController;
use App\Http\Controllers\Api\V1\HomepageController;
use App\Http\Controllers\Api\V1\ModuleController;
use App\Http\Controllers\Api\V1\SearchController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'version' => 'v1', 'docs' => url('/docs/api')]));

// Public routes
Route::get('/homepage', [HomepageController::class, 'show']);
Route::get('/divisions', [DivisionPageController::class, 'index']);
Route::get('/divisions/{slug}', [DivisionPageController::class, 'show']);
Route::get('/ads', [PlatformSettingsController::class, 'publicAds']);
Route::get('/brand', [PlatformSettingsController::class, 'publicBrand']);
Route::get('/modules', [ModuleController::class, 'index']);
Route::get('/search', [SearchController::class, 'search']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
});

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::delete('/avatar', [ProfileController::class, 'removeAvatar']);
    });

    Route::prefix('payments')->group(function () {
        Route::post('/razorpay/order', [\App\Http\Controllers\Api\V1\Payments\PaymentController::class, 'createOrder']);
        Route::post('/razorpay/verify', [\App\Http\Controllers\Api\V1\Payments\PaymentController::class, 'verify']);
    });
});
