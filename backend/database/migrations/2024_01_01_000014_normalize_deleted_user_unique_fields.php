<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->where('phone', '')->update(['phone' => null]);

        $deletedUsers = DB::table('users')->whereNotNull('deleted_at')->get(['id', 'email', 'phone']);

        foreach ($deletedUsers as $user) {
            $updates = [];

            $emailSuffix = ".deleted.{$user->id}";
            if ($user->email && ! str_ends_with($user->email, $emailSuffix)) {
                $updates['email'] = $user->email.$emailSuffix;
            }

            if ($user->phone) {
                if (! str_ends_with($user->phone, $emailSuffix)) {
                    $updates['phone'] = $user->phone.$emailSuffix;
                }
            }

            if ($updates !== []) {
                DB::table('users')->where('id', $user->id)->update($updates);
            }
        }
    }

    public function down(): void
    {
        // Irreversible data normalization.
    }
};
