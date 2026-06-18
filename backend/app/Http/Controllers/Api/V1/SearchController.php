<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = $request->string('q')->trim();
        $module = $request->string('module')->trim();
        $limit = min($request->integer('limit', 20), 50);

        if ($query->isEmpty()) {
            return response()->json(['data' => []]);
        }

        $builder = DB::table('search_index')
            ->where(function ($q) use ($query) {
                $q->whereLikeInsensitive('title', "%{$query}%")
                    ->orWhereLikeInsensitive('content', "%{$query}%");
            });

        if ($module->isNotEmpty()) {
            $builder->where('module', $module);
        }

        $results = $builder->limit($limit)->get();

        return response()->json(['data' => $results]);
    }
}
