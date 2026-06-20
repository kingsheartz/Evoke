<?php

use App\Http\Controllers\Api\V1\Academy\BatchController;
use App\Http\Controllers\Api\V1\Academy\CategoryController as AcademyCategoryController;
use App\Http\Controllers\Api\V1\Academy\CourseController;
use App\Http\Controllers\Api\V1\Academy\EnrollmentController;
use App\Http\Controllers\Api\V1\Academy\TrainerController;
use App\Http\Controllers\Api\V1\Academy\AttendanceController;
use App\Http\Controllers\Api\V1\Academy\CertificateController;
use Illuminate\Support\Facades\Route;

Route::prefix('academy')->middleware(['module.enabled:academy'])->group(function () {
    Route::get('/categories', [CourseController::class, 'categories']);
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/enrollments', [EnrollmentController::class, 'store']);
        Route::get('/enrollments', [EnrollmentController::class, 'index']);
        Route::get('/certificates', [CertificateController::class, 'indexForUser']);
    });

    Route::middleware(['auth:sanctum', 'permission:academy.courses.manage'])->group(function () {
        Route::get('/admin/categories', [AcademyCategoryController::class, 'index']);
        Route::post('/admin/categories', [AcademyCategoryController::class, 'store']);
        Route::get('/admin/courses', [CourseController::class, 'adminIndex']);
        Route::get('/admin/courses/{course}', [CourseController::class, 'adminShow']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::get('/admin/courses/{course}/batches', [BatchController::class, 'index']);
        Route::post('/admin/courses/{course}/batches', [BatchController::class, 'store']);
        Route::put('/admin/courses/{course}/batches/{batch}', [BatchController::class, 'update']);
        Route::delete('/admin/courses/{course}/batches/{batch}', [BatchController::class, 'destroy']);
        Route::get('/admin/trainers', [TrainerController::class, 'adminIndex']);
        Route::get('/admin/trainers/{trainer}', [TrainerController::class, 'adminShow']);
        Route::post('/admin/trainers', [TrainerController::class, 'store']);
        Route::put('/admin/trainers/{trainer}', [TrainerController::class, 'update']);
        Route::delete('/admin/trainers/{trainer}', [TrainerController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'permission:academy.enrollments.manage'])->group(function () {
        Route::put('/admin/enrollments/{enrollment}', [EnrollmentController::class, 'adminUpdate']);
    });

    Route::middleware(['auth:sanctum', 'permission:academy.attendance.manage'])->group(function () {
        Route::get('/admin/attendance', [AttendanceController::class, 'adminIndex']);
        Route::post('/admin/attendance', [AttendanceController::class, 'store']);
        Route::get('/admin/attendance/enrollments', [AttendanceController::class, 'enrollmentsForMarking']);
    });

    Route::middleware(['auth:sanctum', 'permission:academy.certificates.manage'])->group(function () {
        Route::get('/admin/certificates', [CertificateController::class, 'adminIndex']);
        Route::post('/admin/certificates', [CertificateController::class, 'store']);
    });
});
