<?php

namespace App\Infrastructure\Persistence\Repositories;

use App\Domain\Shared\Contracts\ModuleRepositoryInterface;
use App\Models\BusinessModule;
use Illuminate\Support\Facades\Cache;

class ModuleRepository implements ModuleRepositoryInterface
{
    public function isEnabled(string $slug): bool
    {
        return Cache::remember("module.{$slug}.enabled", 3600, function () use ($slug) {
            return BusinessModule::query()
                ->where('slug', $slug)
                ->where('is_enabled', true)
                ->exists();
        });
    }

    public function all(): array
    {
        return BusinessModule::query()
            ->orderBy('sort_order')
            ->get(['slug', 'name', 'is_enabled'])
            ->map(fn (BusinessModule $m) => [
                'slug' => $m->slug,
                'name' => $m->name,
                'enabled' => $m->is_enabled,
            ])
            ->all();
    }
}
