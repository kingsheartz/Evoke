<?php

namespace App\Application\Auth\Services;

use App\Models\User;
use App\Support\FirebaseAdminAuth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AccountDeletionService
{
    private const STAFF_ROLES = [
        'super-admin',
        'academy-manager',
        'shop-manager',
        'travel-manager',
        'trainer',
    ];

    public function __construct(private FirebaseAdminAuth $firebaseAdminAuth) {}

    public function deleteAccount(User $user, string $email, ?string $password = null): void
    {
        if (strcasecmp($user->email, $email) !== 0) {
            throw ValidationException::withMessages([
                'email' => ['Email confirmation does not match your account.'],
            ]);
        }

        if ($user->hasAnyRole(self::STAFF_ROLES)) {
            throw ValidationException::withMessages([
                'email' => ['Staff accounts cannot be deleted here. Contact an administrator.'],
            ]);
        }

        if (is_string($user->password) && $user->password !== '') {
            if ($password === null || $password === '' || ! Hash::check($password, $user->password)) {
                throw ValidationException::withMessages([
                    'password' => ['Enter your current password to delete this account.'],
                ]);
            }
        }

        $this->removeFirebaseAuthUser($user);

        $user->tokens()->delete();
        $user->deviceTokens()->delete();
        // Clear before soft-delete so firebase_uid unique index does not block re-registration.
        $user->firebase_uid = null;
        $user->saveQuietly();
        // Soft-delete: row kept with deleted_at for order/enrollment records; email scrubbed in User::deleting.
        $user->delete();
    }

    private function removeFirebaseAuthUser(User $user): void
    {
        if (! $this->firebaseAdminAuth->configured()) {
            if (app()->environment('production')) {
                throw ValidationException::withMessages([
                    'email' => [
                        'Account deletion is unavailable: Firebase Admin is not configured on the server (FIREBASE_PROJECT_ID / FIREBASE_CREDENTIALS_JSON on Render).',
                    ],
                ]);
            }

            Log::warning('Skipping Firebase Auth removal — Admin SDK not configured', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return;
        }

        try {
            $this->firebaseAdminAuth->removeUserForAccount(
                $user->email,
                filled($user->firebase_uid) ? (string) $user->firebase_uid : null,
            );
        } catch (\Throwable $e) {
            Log::error('Firebase Auth user removal failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'firebase_uid' => $user->firebase_uid,
                'error' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'email' => [$this->firebaseDeletionErrorMessage($e)],
            ]);
        }
    }

    private function firebaseDeletionErrorMessage(\Throwable $e): string
    {
        $message = $e->getMessage();

        if (str_contains($message, '403') || stripos($message, 'permission') !== false) {
            return 'Could not remove Firebase sign-in: the server service account lacks permission. In Google Cloud, enable Identity Toolkit API and grant Firebase Authentication Admin to the service account used on Render.';
        }

        if (str_contains($message, '401') || stripos($message, 'credentials') !== false) {
            return 'Could not remove Firebase sign-in: invalid Firebase Admin credentials on the server (check FIREBASE_CREDENTIALS_JSON on Render).';
        }

        if (str_contains($message, 'still exists after delete')) {
            return 'Could not remove Firebase sign-in: the Firebase account still exists after delete was attempted. Try again in a minute or remove the user in Firebase Console → Authentication.';
        }

        return 'Could not remove your Firebase sign-in. Try again or contact support.';
    }
}
