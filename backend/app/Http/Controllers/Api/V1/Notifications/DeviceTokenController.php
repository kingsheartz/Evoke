<?php

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Support\FirebaseMessaging;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeviceTokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:512'],
            'platform' => ['required', 'string', 'in:web,android,ios'],
        ]);

        DeviceToken::query()->updateOrCreate(
            ['token' => $validated['token']],
            [
                'user_id' => $request->user()->id,
                'platform' => $validated['platform'],
                'user_agent' => Str::limit($request->userAgent() ?? '', 512, ''),
                'last_used_at' => now(),
            ],
        );

        return response()->json(['message' => 'Device token registered.']);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:512'],
        ]);

        DeviceToken::query()
            ->where('user_id', $request->user()->id)
            ->where('token', $validated['token'])
            ->delete();

        return response()->json(['message' => 'Device token removed.']);
    }

    public function sendTest(Request $request, FirebaseMessaging $messaging): JsonResponse
    {
        if (! $messaging->configured()) {
            return response()->json(['message' => 'Firebase is not configured on the server.'], 503);
        }

        $tokens = DeviceToken::query()
            ->where('user_id', $request->user()->id)
            ->pluck('token');

        if ($tokens->isEmpty()) {
            return response()->json(['message' => 'No device tokens registered. Enable notifications first.'], 422);
        }

        $sent = 0;
        $failed = 0;

        foreach ($tokens as $deviceToken) {
            $result = $messaging->sendToDevice(
                $deviceToken,
                'Evoke test notification',
                'Push notifications are working on this device.',
                ['event' => 'test.push'],
            );

            if ($result === 'sent') {
                $sent++;
            } else {
                $failed++;
                if ($result === 'invalid_token') {
                    DeviceToken::query()->where('token', $deviceToken)->delete();
                }
            }
        }

        if ($sent === 0) {
            return response()->json([
                'message' => 'Could not deliver the test notification. Check Firebase credentials and try enabling notifications again.',
                'data' => ['sent' => 0, 'failed' => $failed],
            ], 502);
        }

        return response()->json([
            'message' => 'Test notification sent.',
            'data' => ['sent' => $sent, 'failed' => $failed],
        ]);
    }
}
