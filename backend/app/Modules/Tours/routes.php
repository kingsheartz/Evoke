<?php

use App\Http\Controllers\Api\V1\Recommendations\OfferingRecommendationController;
use App\Http\Controllers\Api\V1\Tours\ItineraryController;
use App\Http\Controllers\Api\V1\Tours\PackageController;
use App\Http\Controllers\Api\V1\Tours\BookingController;
use App\Http\Controllers\Api\V1\Tours\EnquiryController;
use Illuminate\Support\Facades\Route;

Route::prefix('tours')->middleware(['module.enabled:tours'])->group(function () {
    Route::get('/trending', [OfferingRecommendationController::class, 'trendingTours']);
    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{slug}/related', [OfferingRecommendationController::class, 'relatedTourPackage']);
    Route::get('/packages/{slug}', [PackageController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings', [BookingController::class, 'index']);
    });

    Route::post('/enquiries', [EnquiryController::class, 'store']);

    Route::middleware(['auth:sanctum', 'permission:tours.packages.manage'])->group(function () {
        Route::get('/admin/packages', [PackageController::class, 'adminIndex']);
        Route::get('/admin/packages/{package}', [PackageController::class, 'adminShow']);
        Route::post('/packages', [PackageController::class, 'store']);
        Route::put('/packages/{package}', [PackageController::class, 'update']);
        Route::get('/admin/packages/{package}/itinerary', [ItineraryController::class, 'index']);
        Route::post('/admin/packages/{package}/itinerary', [ItineraryController::class, 'store']);
        Route::put('/admin/packages/{package}/itinerary/{day}', [ItineraryController::class, 'update']);
        Route::delete('/admin/packages/{package}/itinerary/{day}', [ItineraryController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'permission:tours.bookings.manage'])->group(function () {
        Route::get('/admin/bookings', [BookingController::class, 'adminIndex']);
        Route::put('/admin/bookings/{booking}', [BookingController::class, 'adminUpdate']);
    });

    Route::middleware(['auth:sanctum', 'permission:tours.enquiries.manage'])->group(function () {
        Route::get('/admin/enquiries', [EnquiryController::class, 'adminIndex']);
        Route::put('/admin/enquiries/{enquiry}', [EnquiryController::class, 'adminUpdate']);
    });
});
