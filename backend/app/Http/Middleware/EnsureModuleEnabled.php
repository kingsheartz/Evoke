<?php

namespace App\Http\Middleware;

use App\Domain\Shared\Contracts\ModuleRepositoryInterface;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleEnabled
{
    public function __construct(
        private readonly ModuleRepositoryInterface $modules,
    ) {}

    public function handle(Request $request, Closure $next, string $module): Response
    {
        if (! $this->modules->isEnabled($module)) {
            return response()->json([
                'message' => "The {$module} module is currently disabled.",
            ], 403);
        }

        return $next($request);
    }
}
