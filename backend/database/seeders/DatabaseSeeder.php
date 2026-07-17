<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\BusinessModule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            BusinessModuleSeeder::class,
            HomepageSeeder::class,
            DivisionPageSeeder::class,
            PlatformSettingsSeeder::class,
            NotificationTemplateSeeder::class,
            AcademyCategorySeeder::class,
            ShopCategorySeeder::class,
            DemoWebsiteSeeder::class,
        ]);

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
