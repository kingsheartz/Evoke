<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HomepageSeeder extends Seeder
{
    public function run(): void
    {
        $meta = [
            'stats' => [
                'enabled' => true,
                'items' => [
                    ['value' => '3', 'label' => 'Business Divisions'],
                    ['value' => '12+', 'label' => 'Academy Programs'],
                    ['value' => '500+', 'label' => 'Products Listed'],
                    ['value' => '50+', 'label' => 'Travel Packages'],
                ],
            ],
            'features' => [
                'enabled' => true,
                'eyebrow' => 'Why Evoke',
                'heading' => 'Built for excellence',
                'items' => [
                    ['icon' => 'sparkles', 'title' => 'Premium Experience', 'description' => 'Every touchpoint designed with intention — from booking to delivery.'],
                    ['icon' => 'users', 'title' => 'Expert-Led Academy', 'description' => 'World-class instructors across karate, yoga, swimming, dance, and more.'],
                    ['icon' => 'target', 'title' => 'Curated Sports Gear', 'description' => 'Hand-picked equipment and apparel for athletes at every level.'],
                    ['icon' => 'globe', 'title' => 'Global Adventures', 'description' => 'Domestic getaways, international tours, and adrenaline-packed expeditions.'],
                    ['icon' => 'shield', 'title' => 'Trusted Platform', 'description' => 'Secure payments, verified partners, and transparent booking flows.'],
                    ['icon' => 'award', 'title' => 'One Membership', 'description' => 'Unified accounts across all three divisions — seamless and simple.'],
                ],
            ],
            'sections' => [],
        ];

        $payload = [
            'hero_heading' => 'Welcome to Evoke',
            'hero_subheading' => 'Academy · Sports Shop · Tours & Travels',
            'hero_background_type' => 'video',
            'hero_background_url' => null,
            'hero_video_url' => '/videos/EVOKE-videoplayback.mp4',
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
            'meta' => json_encode($meta),
            'is_active' => true,
            'updated_at' => now(),
        ];

        $existing = DB::table('homepage_settings')->where('is_active', true)->first();

        if ($existing) {
            DB::table('homepage_settings')->where('id', $existing->id)->update($payload);
        } else {
            DB::table('homepage_settings')->insert([
                ...$payload,
                'created_at' => now(),
            ]);
        }
    }
}
