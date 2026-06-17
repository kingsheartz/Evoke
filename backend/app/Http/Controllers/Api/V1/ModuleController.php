<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Shared\Contracts\ModuleRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    public function __construct(
        private readonly ModuleRepositoryInterface $modules,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->modules->all()]);
    }
}
