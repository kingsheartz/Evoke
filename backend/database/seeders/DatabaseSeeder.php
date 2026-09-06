<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(DemoDataSeeder::class);

        if (filter_var(env('SEED_SKIP_ADMIN', false), FILTER_VALIDATE_BOOLEAN)) {
            return;
        }

        $branch = Branch::firstOrCreate(
            ['slug' => 'evoke-hq'],
            [
                'name' => 'Evoke HQ',
                'city' => 'Mumbai',
                'country' => 'India',
                'is_active' => true,
            ],
        );

        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@evoke.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'branch_id' => $branch->id,
                'email_verified_at' => now(),
            ],
        );

        if (! $superAdmin->hasRole('super-admin')) {
            $superAdmin->assignRole('super-admin');
        }
    }
}
