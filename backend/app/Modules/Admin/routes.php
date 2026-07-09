<?php

use App\Http\Controllers\Api\V1\Admin\ContextController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\ModuleController;
use App\Http\Controllers\Api\V1\Admin\PlatformSettingsController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\TaskController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/context', ContextController::class);
    Route::get('/dashboard', DashboardController::class)->middleware('permission:analytics.view');

    Route::middleware('permission:tasks.manage')->group(function () {
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::put('/tasks/{task}', [TaskController::class, 'update']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    });

    Route::middleware('permission:modules.manage')->group(function () {
        Route::get('/modules', [ModuleController::class, 'index']);
        Route::put('/modules/{module}', [ModuleController::class, 'update']);
    });

    Route::middleware('permission:users.manage|roles.manage')->group(function () {
        Route::get('/roles', [UserController::class, 'roles']);
        Route::get('/permissions', [RoleController::class, 'permissions']);
        Route::get('/roles/manage', [RoleController::class, 'index']);
        Route::post('/roles/manage', [RoleController::class, 'store']);
        Route::put('/roles/manage/{role}', [RoleController::class, 'update']);
        Route::delete('/roles/manage/{role}', [RoleController::class, 'destroy']);
        Route::get('/branches', [UserController::class, 'branches']);
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::post('/users/{user}/avatar', [UserController::class, 'uploadAvatar']);
        Route::delete('/users/{user}/avatar', [UserController::class, 'removeAvatar']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    Route::middleware('permission:platform.manage')->group(function () {
        Route::get('/settings/{key}', [PlatformSettingsController::class, 'show'])
            ->where('key', 'admin_preferences|advertisements|payments');
        Route::put('/settings/{key}', [PlatformSettingsController::class, 'update'])
            ->where('key', 'admin_preferences|advertisements|payments');
    });

    Route::middleware('permission:platform.manage|cms.homepage.manage|cms.pages.manage')->group(function () {
        Route::get('/settings/brand', fn (Request $request, PlatformSettingsController $controller) => $controller->show($request, 'brand'));
        Route::put('/settings/brand', fn (Request $request, PlatformSettingsController $controller) => $controller->update($request, 'brand'));
    });
});
