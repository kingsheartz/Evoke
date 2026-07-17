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
                'eyebrow' => 'Why EOKE',
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
            'motion' => [
                'chapters' => [
                    [
                        'id' => 'academy',
                        'art_theme' => 'academy',
                        'label' => 'Academy',
                        'eyebrow' => 'EVOKE Academy',
                        'title' => 'Train with purpose',
                        'description' => 'Martial arts, yoga, swimming — structured programs led by coaches who care about progress.',
                        'href' => '/academy',
                        'cta' => 'Browse courses',
                        'tags' => ['Karate', 'Yoga', 'Swimming'],
                        'start_icon' => 'graduation-cap',
                        'end_icon' => 'map-pin',
                        'sort_order' => 0,
                    ],
                    [
                        'id' => 'sports',
                        'art_theme' => 'sports',
                        'label' => 'Sports',
                        'eyebrow' => 'EOKE Sports',
                        'title' => 'Play at your peak',
                        'description' => 'Gear, apparel, and equipment for athletes who show up — from training days to match day.',
                        'href' => '/shop',
                        'cta' => 'Shop now',
                        'tags' => ['Equipment', 'Apparel', 'Accessories'],
                        'start_icon' => 'shopping-bag',
                        'end_icon' => 'map-pin',
                        'sort_order' => 1,
                    ],
                    [
                        'id' => 'tours',
                        'art_theme' => 'tours',
                        'label' => 'Tours',
                        'eyebrow' => 'EVOKE Tours',
                        'title' => 'Travel that moves you',
                        'description' => 'Handpicked domestic and international journeys — adventure, culture, and memories in motion.',
                        'href' => '/tours',
                        'cta' => 'View packages',
                        'tags' => ['Domestic', 'International', 'Adventure'],
                        'start_icon' => 'map-pin',
                        'end_icon' => 'map-pin',
                        'sort_order' => 2,
                    ],
                ],
            ],
        ];

        $payload = [
            'hero_heading' => 'Welcome to EOKE Groups',
            'hero_subheading' => 'EVOKE Academy · EOKE Sports · EVOKE Tours',
            'hero_background_type' => 'video',
            'hero_background_url' => null,
            'hero_video_url' => '/videos/EVOKE-videoplayback.mp4',
            'hero_cta_text' => 'Explore Our World',
            'hero_cta_url' => '#divisions',
            'entry_cards' => json_encode([
                [
                    'slug' => 'academy',
                    'title' => 'EVOKE Academy',
                    'description' => 'Karate, Yoga, Swimming, Dance & more',
                    'icon' => 'graduation-cap',
                    'url' => '/academy',
                    'gradient' => 'from-blue-600 to-indigo-700',
                ],
                [
                    'slug' => 'shop',
                    'title' => 'EOKE Sports',
                    'description' => 'Equipment, apparel & fitness accessories',
                    'icon' => 'shopping-bag',
                    'url' => '/shop',
                    'gradient' => 'from-emerald-600 to-teal-700',
                ],
                [
                    'slug' => 'tours',
                    'title' => 'EVOKE Tours',
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
