<?php

use App\Http\Controllers\Api\V1\Notifications\DeviceTokenController;
use App\Http\Controllers\Api\V1\Notifications\NotificationController;
use App\Http\Controllers\Api\V1\Newsletter\NewsletterCampaignController;
use App\Http\Controllers\Api\V1\Newsletter\NewsletterSubscriberController;
use Illuminate\Support\Facades\Route;

Route::prefix('notifications')->middleware(['module.enabled:notifications', 'auth:sanctum'])->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
    Route::delete('/device-tokens', [DeviceTokenController::class, 'destroy']);
    Route::post('/test-push', [DeviceTokenController::class, 'sendTest']);
    Route::post('/test-email', [NotificationController::class, 'sendTestEmail']);
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
});

Route::prefix('newsletter')->middleware(['auth:sanctum', 'permission:notifications.manage'])->group(function () {
    Route::get('/stats', [NewsletterCampaignController::class, 'stats']);
    Route::get('/subscribers', [NewsletterSubscriberController::class, 'index']);
    Route::get('/campaigns', [NewsletterCampaignController::class, 'index']);
    Route::post('/campaigns', [NewsletterCampaignController::class, 'store']);
    Route::get('/campaigns/{campaign}', [NewsletterCampaignController::class, 'show']);
    Route::put('/campaigns/{campaign}', [NewsletterCampaignController::class, 'update']);
    Route::delete('/campaigns/{campaign}', [NewsletterCampaignController::class, 'destroy']);
    Route::post('/campaigns/{campaign}/send', [NewsletterCampaignController::class, 'send']);
    Route::post('/campaigns/{campaign}/test', [NewsletterCampaignController::class, 'sendTest']);
});
