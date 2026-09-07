<?php

namespace App\Http\Controllers\Api\V1\Newsletter;

use App\Http\Controllers\Controller;
use App\Models\Newsletter\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterSubscriberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NewsletterSubscriber::query()->orderByDesc('subscribed_at');

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($search = trim($request->string('search')->toString())) {
            $escaped = addcslashes($search, '%_\\');
            $query->where('email', 'like', "%{$escaped}%");
        }

        return response()->json($query->paginate($request->integer('per_page', 20)));
    }
}
