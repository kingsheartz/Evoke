<?php

namespace App\Providers;

use App\Domain\Shared\Contracts\ModuleRepositoryInterface;
use App\Infrastructure\Persistence\Repositories\ModuleRepository;
use App\Support\DatabaseCompatibility;
use Dedoc\Scramble\Scramble;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Routing\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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

        Scramble::configure()
            ->routes(function (Route $route) {
                return Str::startsWith($route->uri(), 'api/v1');
            })
            ->withOperationTransformers(function ($operation, $routeInfo) {
                $uri = $routeInfo->route->uri();

                $tag = match (true) {
                    $uri === 'api/v1/health' => 'System',
                    Str::startsWith($uri, 'api/v1/auth') => 'Auth',
                    Str::startsWith($uri, ['api/v1/homepage', 'api/v1/divisions', 'api/v1/ads', 'api/v1/brand', 'api/v1/modules', 'api/v1/search']) => 'Public',
                    Str::startsWith($uri, 'api/v1/cms') => 'CMS',
                    Str::startsWith($uri, 'api/v1/admin') => 'Admin',
                    Str::startsWith($uri, 'api/v1/academy') => 'Academy',
                    Str::startsWith($uri, 'api/v1/shop') => 'Shop',
                    Str::startsWith($uri, 'api/v1/tours') => 'Tours',
                    Str::startsWith($uri, 'api/v1/notifications') => 'Notifications',
                    default => null,
                };

                if ($tag !== null) {
                    $operation->setTags([$tag]);
                }
            });
    }
}
