<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/** Demo catalog, CMS, settings, and templates — no user accounts. */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // One-off CLI seeding — avoid database/redis cache when env omits CACHE_STORE.
        config(['cache.default' => 'array']);

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
    }
}
