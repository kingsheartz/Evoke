<?php

namespace App\Providers;

use App\Domain\Shared\Contracts\ModuleRepositoryInterface;
use App\Infrastructure\Persistence\Repositories\ModuleRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ModuleRepositoryInterface::class, ModuleRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
