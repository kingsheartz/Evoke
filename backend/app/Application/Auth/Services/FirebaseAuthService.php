<?php

namespace App\Application\Auth\Services;

use App\Models\User;
use App\Support\FirebaseIdTokenVerifier;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FirebaseAuthService
{
    public function __construct(private FirebaseIdTokenVerifier $verifier) {}

    /** @return array{user: User, token: string} */
    public function authenticate(string $idToken): array
    {
        $claims = $this->verifier->verify($idToken);

        $firebaseUid = (string) $claims['sub'];
        $email = strtolower(trim((string) ($claims['email'] ?? '')));
        $emailVerified = filter_var($claims['email_verified'] ?? false, FILTER_VALIDATE_BOOL);
        $name = trim((string) ($claims['name'] ?? ''));

        $signInProvider = is_array($claims['firebase'] ?? null)
            ? ($claims['firebase']['sign_in_provider'] ?? null)
            : null;

        if ($email === '') {
            throw ValidationException::withMessages([
                'id_token' => ['Firebase account must include an email address.'],
            ]);
        }

        if (! $emailVerified && ! in_array($signInProvider, ['password', 'emailLink'], true)) {
            throw ValidationException::withMessages([
                'id_token' => ['Verify your email before signing in.'],
            ]);
        }

        $user = User::query()->where('firebase_uid', $firebaseUid)->first();
        if ($user !== null) {
            return $this->tokenResponse($user);
        }

        $existing = User::query()->where('email', $email)->first();
        if ($existing !== null) {
            if ($existing->firebase_uid !== null && $existing->firebase_uid !== $firebaseUid) {
                throw ValidationException::withMessages([
                    'email' => ['This email is linked to another sign-in method.'],
                ]);
            }

            if ($existing->hasAnyRole(['super-admin', 'academy-manager', 'shop-manager', 'travel-manager', 'trainer'])) {
                throw ValidationException::withMessages([
                    'email' => ['This email belongs to a staff account. Use the admin portal to sign in.'],
                ]);
            }

            $existing->update([
                'firebase_uid' => $firebaseUid,
                'email_verified_at' => $emailVerified ? ($existing->email_verified_at ?? now()) : $existing->email_verified_at,
            ]);

            return $this->tokenResponse($existing);
        }

        if ($name === '') {
            $name = Str::before($email, '@') ?: 'User';
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'firebase_uid' => $firebaseUid,
            'password' => null,
            'email_verified_at' => $emailVerified ? now() : null,
        ]);

        $user->assignRole('customer');

        return $this->tokenResponse($user);
    }

    /** @return array{user: User, token: string} */
    private function tokenResponse(User $user): array
    {
        return [
            'user' => $user->forAuthResponse(),
            'token' => $user->createToken('auth-token')->plainTextToken,
        ];
    }
}
