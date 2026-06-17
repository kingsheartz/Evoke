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
            NotificationTemplateSeeder::class,
            AcademyCategorySeeder::class,
            ShopCategorySeeder::class,
        ]);

        $branch = Branch::create([
            'name' => 'Evoke HQ',
            'slug' => 'evoke-hq',
            'city' => 'Mumbai',
            'country' => 'India',
            'is_active' => true,
        ]);

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@evoke.com',
            'password' => Hash::make('password'),
            'branch_id' => $branch->id,
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('super-admin');
    }
}
