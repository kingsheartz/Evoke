<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeds demo catalog, academy, tours, and CMS content for a launch-ready site.
 * Disable with SEED_DEMO=false in .env.
 */
class DemoWebsiteSeeder extends Seeder
{
    public function run(): void
    {
        if (filter_var(env('SEED_DEMO', true), FILTER_VALIDATE_BOOLEAN) === false) {
            return;
        }

        $this->call([
            ShopProductSeeder::class,
            AcademyDemoSeeder::class,
            TourPackageSeeder::class,
            CmsDemoSeeder::class,
        ]);
    }
}
