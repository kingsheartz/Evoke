<?php

use App\Http\Controllers\Api\V1\Shop\CategoryController as ShopCategoryController;
use App\Http\Controllers\Api\V1\Shop\ProductController;
use App\Http\Controllers\Api\V1\Shop\ProductVariantController;
use App\Http\Controllers\Api\V1\Shop\CartController;
use App\Http\Controllers\Api\V1\Shop\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('shop')->middleware(['module.enabled:shop'])->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductController::class, 'categories']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/cart', [CartController::class, 'show']);
        Route::post('/cart/items', [CartController::class, 'addItem']);
        Route::delete('/cart/items/{item}', [CartController::class, 'removeItem']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
    });

    Route::middleware(['auth:sanctum', 'permission:shop.products.manage'])->group(function () {
        Route::get('/admin/categories', [ShopCategoryController::class, 'index']);
        Route::post('/admin/categories', [ShopCategoryController::class, 'store']);
        Route::get('/admin/products', [ProductController::class, 'adminIndex']);
        Route::get('/admin/products/{product}', [ProductController::class, 'adminShow']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::get('/admin/products/{product}/variants', [ProductVariantController::class, 'index']);
        Route::post('/admin/products/{product}/variants', [ProductVariantController::class, 'store']);
        Route::put('/admin/products/{product}/variants/{variant}', [ProductVariantController::class, 'update']);
        Route::delete('/admin/products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'permission:shop.orders.manage'])->group(function () {
        Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
        Route::put('/admin/orders/{order}', [OrderController::class, 'adminUpdate']);
    });
});
