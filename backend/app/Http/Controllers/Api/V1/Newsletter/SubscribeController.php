<?php

namespace App\Http\Controllers\Api\V1\Newsletter;

use App\Http\Controllers\Controller;
use App\Models\Newsletter\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscribeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email:rfc,dns|max:255',
        ]);

        NewsletterSubscriber::subscribeEmail($validated['email']);

        return response()->json([
            'message' => 'Thanks for subscribing! You will receive updates from us.',
        ]);
    }
}
