<?php

use App\Http\Controllers\Api\V1\Admin\ContextController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\ModuleController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/context', ContextController::class);
    Route::get('/dashboard', DashboardController::class)->middleware('permission:analytics.view');

    Route::middleware('permission:modules.manage')->group(function () {
        Route::get('/modules', [ModuleController::class, 'index']);
        Route::put('/modules/{module}', [ModuleController::class, 'update']);
    });

    Route::middleware('permission:users.manage')->group(function () {
        Route::get('/roles', [UserController::class, 'roles']);
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});
