<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HomepageSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('homepage_settings')->insert([
            'hero_heading' => 'Welcome to Evoke',
            'hero_subheading' => 'Academy · Sports Shop · Tours & Travels',
            'hero_background_type' => 'gradient',
            'hero_cta_text' => 'Explore Our World',
            'hero_cta_url' => '#divisions',
            'entry_cards' => json_encode([
                [
                    'slug' => 'academy',
                    'title' => 'Evoke Academy',
                    'description' => 'Karate, Yoga, Swimming, Dance & more',
                    'icon' => 'graduation-cap',
                    'url' => '/academy',
                    'gradient' => 'from-blue-600 to-indigo-700',
                ],
                [
                    'slug' => 'shop',
                    'title' => 'Sports Shop',
                    'description' => 'Equipment, apparel & fitness accessories',
                    'icon' => 'shopping-bag',
                    'url' => '/shop',
                    'gradient' => 'from-emerald-600 to-teal-700',
                ],
                [
                    'slug' => 'tours',
                    'title' => 'Tours & Travels',
                    'description' => 'Domestic, international & adventure packages',
                    'icon' => 'plane',
                    'url' => '/tours',
                    'gradient' => 'from-orange-600 to-rose-700',
                ],
            ]),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
