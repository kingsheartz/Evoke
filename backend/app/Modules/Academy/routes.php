<?php

use App\Http\Controllers\Api\V1\Academy\CourseController;
use App\Http\Controllers\Api\V1\Academy\EnrollmentController;
use Illuminate\Support\Facades\Route;

Route::prefix('academy')->middleware(['module.enabled:academy'])->group(function () {
    Route::get('/categories', [CourseController::class, 'categories']);
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/enrollments', [EnrollmentController::class, 'store']);
        Route::get('/enrollments', [EnrollmentController::class, 'index']);
    });

    Route::middleware(['auth:sanctum', 'permission:academy.courses.manage'])->group(function () {
        Route::get('/admin/courses', [CourseController::class, 'adminIndex']);
        Route::get('/admin/courses/{course}', [CourseController::class, 'adminShow']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
    });
});
