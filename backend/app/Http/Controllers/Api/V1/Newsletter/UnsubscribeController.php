<?php

namespace App\Http\Controllers\Api\V1\Newsletter;

use App\Http\Controllers\Controller;
use App\Models\Newsletter\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnsubscribeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|uuid',
        ]);

        $subscriber = NewsletterSubscriber::query()
            ->where('unsubscribe_token', $validated['token'])
            ->first();

        if ($subscriber === null) {
            return response()->json(['message' => 'This unsubscribe link is invalid or has expired.'], 404);
        }

        if ($subscriber->status !== 'unsubscribed') {
            $subscriber->unsubscribe();
        }

        return response()->json([
            'message' => 'You have been unsubscribed from our newsletter.',
            'data' => ['email' => $subscriber->email],
        ]);
    }
}
