<?php

namespace App\Providers;

use App\Domain\Shared\Contracts\ModuleRepositoryInterface;
use App\Infrastructure\Persistence\Repositories\ModuleRepository;
use App\Support\DatabaseCompatibility;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ModuleRepositoryInterface::class, ModuleRepository::class);
    }

    public function boot(): void
    {
        $likeMacro = function (string $column, string $value, string $boolean = 'and') {
            return $this->where($column, DatabaseCompatibility::likeOperator(), $value, $boolean);
        };

        $orLikeMacro = function (string $column, string $value) {
            return $this->orWhere($column, DatabaseCompatibility::likeOperator(), $value);
        };

        QueryBuilder::macro('whereLikeInsensitive', $likeMacro);
        QueryBuilder::macro('orWhereLikeInsensitive', $orLikeMacro);
        EloquentBuilder::macro('whereLikeInsensitive', $likeMacro);
        EloquentBuilder::macro('orWhereLikeInsensitive', $orLikeMacro);
    }
}
