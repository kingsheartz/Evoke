<?php

namespace App\Console\Commands;

use App\Support\FirebaseAdminAuth;
use Illuminate\Console\Command;

class DeleteFirebaseAuthUserCommand extends Command
{
    protected $signature = 'firebase:delete-auth-user {email : Firebase Auth user email}';

    protected $description = 'Delete a Firebase Auth user by email (Identity Toolkit Admin API)';

    public function handle(FirebaseAdminAuth $firebaseAdminAuth): int
    {
        $email = strtolower(trim((string) $this->argument('email')));

        if ($email === '') {
            $this->components->error('Email is required.');

            return self::FAILURE;
        }

        if (! $firebaseAdminAuth->configured()) {
            $this->components->error('Firebase Admin is not configured (FIREBASE_PROJECT_ID + FIREBASE_CREDENTIALS_JSON or FIREBASE_CREDENTIALS_PATH).');

            return self::FAILURE;
        }

        try {
            $uid = $firebaseAdminAuth->findUserUidByEmail($email);
        } catch (\Throwable $e) {
            $this->components->error('Lookup failed: '.$e->getMessage());

            return self::FAILURE;
        }

        if ($uid === null) {
            $this->components->warn("No Firebase Auth user found for {$email}.");

            return self::SUCCESS;
        }

        if (! $this->confirm("Delete Firebase user {$email} (UID {$uid})?", false)) {
            $this->components->warn('Cancelled.');

            return self::FAILURE;
        }

        try {
            $firebaseAdminAuth->removeUserForAccount($email, $uid);
        } catch (\Throwable $e) {
            $this->components->error('Delete failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->components->info("Deleted Firebase Auth user {$email}.");

        return self::SUCCESS;
    }
}
