<?php

namespace App\Application\Auth\Services;

use App\Models\User;
use App\Support\FirebaseAdminAuth;
use Illuminate\Support\Facades\Hash;
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

        $firebaseUid = filled($user->firebase_uid) ? (string) $user->firebase_uid : null;

        if ($this->firebaseAdminAuth->configured()) {
            if ($firebaseUid === null) {
                $firebaseUid = $this->firebaseAdminAuth->findUserUidByEmail($user->email);
            }

            if ($firebaseUid !== null && $firebaseUid !== '') {
                if (! $this->firebaseAdminAuth->deleteUser($firebaseUid)) {
                    throw ValidationException::withMessages([
                        'email' => ['Could not remove your Firebase sign-in. Try again or contact support.'],
                    ]);
                }
            }
        } elseif ($firebaseUid !== null) {
            throw ValidationException::withMessages([
                'email' => ['Account deletion is temporarily unavailable. Try again later.'],
            ]);
        }

        $user->tokens()->delete();
        $user->deviceTokens()->delete();
        $user->firebase_uid = null;
        $user->saveQuietly();
        $user->delete();
    }
}
