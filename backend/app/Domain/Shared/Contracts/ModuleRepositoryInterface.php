<?php

namespace App\Domain\Shared\Contracts;

interface ModuleRepositoryInterface
{
    public function isEnabled(string $slug): bool;

    /** @return array<int, array{slug: string, name: string, enabled: bool}> */
    public function all(): array;
}
