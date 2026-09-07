<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseAdminAuth
{
    private static ?string $accessToken = null;

    private static int $accessTokenExpiresAt = 0;

    public function configured(): bool
    {
        return filled(config('firebase.project_id')) && $this->credentials() !== null;
    }

    /** Delete a Firebase Auth user by UID (Google, email/password, email link). */
    public function deleteUser(string $firebaseUid): bool
    {
        $projectId = config('firebase.project_id');
        if (! is_string($projectId) || $projectId === '') {
            return false;
        }

        if ($firebaseUid === '') {
            return false;
        }

        $response = Http::withToken($this->accessToken())
            ->delete("https://identitytoolkit.googleapis.com/v1/projects/{$projectId}/accounts/{$firebaseUid}");

        if ($response->successful() || $response->status() === 404) {
            return true;
        }

        Log::warning('Firebase Auth user delete failed', [
            'firebase_uid' => $firebaseUid,
            'status' => $response->status(),
            'body' => $response->json(),
        ]);

        return false;
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
        if (self::$accessToken !== null && time() < self::$accessTokenExpiresAt - 60) {
            return self::$accessToken;
        }

        $credentials = $this->credentials();
        if ($credentials === null) {
            throw new \RuntimeException('Firebase credentials not configured.');
        }

        $now = time();
        $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $claim = $this->base64UrlEncode(json_encode([
            'iss' => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/identitytoolkit',
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

        self::$accessToken = $token;
        self::$accessTokenExpiresAt = $now + 3300;

        return $token;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
