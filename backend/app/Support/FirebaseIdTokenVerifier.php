<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class FirebaseIdTokenVerifier
{
    private const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    /**
     * @return array<string, mixed>
     *
     * @throws \RuntimeException
     */
    public function verify(string $idToken): array
    {
        $projectId = config('firebase.project_id');
        if (! is_string($projectId) || $projectId === '') {
            throw new \RuntimeException('Firebase project ID is not configured.');
        }

        $parts = explode('.', $idToken);
        if (count($parts) !== 3) {
            throw new \RuntimeException('Invalid Firebase ID token format.');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $header = $this->decodeJsonPart($encodedHeader);
        $payload = $this->decodeJsonPart($encodedPayload);

        if (($header['alg'] ?? null) !== 'RS256') {
            throw new \RuntimeException('Unsupported Firebase ID token algorithm.');
        }

        $kid = $header['kid'] ?? null;
        if (! is_string($kid) || $kid === '') {
            throw new \RuntimeException('Firebase ID token is missing key id.');
        }

        $certs = $this->certificates();
        $publicKey = $certs[$kid] ?? null;
        if (! is_string($publicKey) || $publicKey === '') {
            throw new \RuntimeException('Unable to resolve Firebase signing certificate.');
        }

        $signature = $this->base64UrlDecode($encodedSignature);
        $signed = $encodedHeader.'.'.$encodedPayload;
        $verified = openssl_verify($signed, $signature, $publicKey, OPENSSL_ALGO_SHA256);

        if ($verified !== 1) {
            throw new \RuntimeException('Firebase ID token signature is invalid.');
        }

        $now = time();
        $exp = (int) ($payload['exp'] ?? 0);
        if ($exp <= $now) {
            throw new \RuntimeException('Firebase ID token has expired.');
        }

        $expectedIssuer = 'https://securetoken.google.com/'.$projectId;
        if (($payload['iss'] ?? null) !== $expectedIssuer) {
            throw new \RuntimeException('Firebase ID token issuer is invalid.');
        }

        if (($payload['aud'] ?? null) !== $projectId) {
            throw new \RuntimeException('Firebase ID token audience is invalid.');
        }

        $subject = $payload['sub'] ?? null;
        if (! is_string($subject) || $subject === '') {
            throw new \RuntimeException('Firebase ID token is missing subject.');
        }

        return $payload;
    }

    /** @return array<string, string> */
    private function certificates(): array
    {
        return Cache::remember('firebase_securetoken_certificates', now()->addHour(), function () {
            $response = Http::timeout(10)->get(self::CERTS_URL);
            $response->throw();

            $decoded = $response->json();
            if (! is_array($decoded)) {
                throw new \RuntimeException('Unable to load Firebase signing certificates.');
            }

            /** @var array<string, string> $decoded */
            return $decoded;
        });
    }

    /** @return array<string, mixed> */
    private function decodeJsonPart(string $encoded): array
    {
        $json = $this->base64UrlDecode($encoded);
        $decoded = json_decode($json, true);

        if (! is_array($decoded)) {
            throw new \RuntimeException('Invalid Firebase ID token payload.');
        }

        return $decoded;
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        $decoded = base64_decode(strtr($value, '-_', '+/'), true);
        if ($decoded === false) {
            throw new \RuntimeException('Invalid Firebase ID token encoding.');
        }

        return $decoded;
    }
}
