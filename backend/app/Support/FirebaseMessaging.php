<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseMessaging
{
    public function configured(): bool
    {
        return filled(config('firebase.project_id')) && $this->credentials() !== null;
    }

    /** @return array<string, mixed>|null */
    private function credentials(): ?array
    {
        $json = config('firebase.credentials_json');
        if (is_string($json) && $json !== '') {
            $decoded = json_decode($json, true);

            return is_array($decoded) ? $decoded : null;
        }

        $path = config('firebase.credentials_path');
        if (is_string($path) && $path !== '' && is_readable($path)) {
            $decoded = json_decode((string) file_get_contents($path), true);

            return is_array($decoded) ? $decoded : null;
        }

        return null;
    }

    private function accessToken(): string
    {
        return Cache::remember('firebase_messaging_access_token', 3300, function () {
            $credentials = $this->credentials();
            if ($credentials === null) {
                throw new \RuntimeException('Firebase credentials not configured.');
            }

            $now = time();
            $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
            $claim = $this->base64UrlEncode(json_encode([
                'iss' => $credentials['client_email'],
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ], JSON_THROW_ON_ERROR));

            $unsigned = "{$header}.{$claim}";
            $privateKey = openssl_pkey_get_private($credentials['private_key']);
            if ($privateKey === false) {
                throw new \RuntimeException('Invalid Firebase private key.');
            }

            $signature = '';
            if (! openssl_sign($unsigned, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
                throw new \RuntimeException('Unable to sign Firebase JWT.');
            }

            $jwt = $unsigned.'.'.$this->base64UrlEncode($signature);

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            $response->throw();

            $token = $response->json('access_token');
            if (! is_string($token) || $token === '') {
                throw new \RuntimeException('Firebase OAuth token response missing access_token.');
            }

            return $token;
        });
    }

    /**
     * @param  array<string, scalar|null>  $data
     * @return 'sent'|'invalid_token'|'failed'
     */
    public function sendToDevice(string $deviceToken, string $title, string $body, array $data = []): string
    {
        $projectId = config('firebase.project_id');
        if (! is_string($projectId) || $projectId === '') {
            return 'failed';
        }

        $payload = [
            'message' => [
                'token' => $deviceToken,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                ],
                'data' => collect($data)
                    ->mapWithKeys(fn ($value, $key) => [(string) $key => (string) $value])
                    ->all(),
                'webpush' => [
                    'fcm_options' => [
                        'link' => (string) config('firebase.web_link'),
                    ],
                ],
            ],
        ];

        $response = Http::withToken($this->accessToken())
            ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", $payload);

        if ($response->successful()) {
            return 'sent';
        }

        $errorBody = strtolower((string) $response->body());
        if (
            str_contains($errorBody, 'unregistered')
            || str_contains($errorBody, 'invalid_argument')
            || str_contains($errorBody, 'not found')
            || $response->status() === 404
        ) {
            return 'invalid_token';
        }

        Log::warning('FCM send failed', [
            'status' => $response->status(),
            'body' => $response->json(),
        ]);

        return 'failed';
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
