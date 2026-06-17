<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $modules = ['Academy', 'Shop', 'Tours', 'CMS', 'Notifications', 'Admin'];

        foreach ($modules as $module) {
            $routePath = base_path("app/Modules/{$module}/routes.php");
            if (file_exists($routePath)) {
                Route::middleware('api')
                    ->prefix('api/v1')
                    ->group($routePath);
            }
        }
    }
}
