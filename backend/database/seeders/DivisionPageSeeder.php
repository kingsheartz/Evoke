<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DivisionPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'academy',
                'nav_label' => 'EVOKE Academy',
                'sort_order' => 1,
                'badge' => 'EVOKE Academy',
                'title' => 'Train with the best',
                'description' => 'World-class instruction across martial arts, wellness, aquatics, and performing arts — all under one roof.',
                'icon' => 'graduation-cap',
                'accent_style' => 'accent',
                'home_gradient' => 'from-blue-600 to-indigo-700',
                'highlight_cards' => [
                    ['title' => 'Karate', 'description' => 'All ages', 'icon' => 'users'],
                    ['title' => 'Yoga & Wellness', 'description' => 'Beginner to Advanced', 'icon' => 'book-open'],
                    ['title' => 'Swimming', 'description' => 'Certified coaches', 'icon' => 'clock'],
                ],
                'footer_note' => 'Full course catalog and enrollment coming soon.',
            ],
            [
                'slug' => 'shop',
                'nav_label' => 'EOKE Sports',
                'sort_order' => 2,
                'badge' => 'EOKE Sports',
                'title' => 'Gear up to perform',
                'description' => 'Curated equipment, apparel, and fitness accessories — quality-tested and ready to ship.',
                'icon' => 'shopping-bag',
                'accent_style' => 'emerald',
                'home_gradient' => 'from-emerald-600 to-teal-700',
                'highlight_cards' => [
                    ['title' => 'Equipment', 'description' => 'Professional-grade gear for every sport', 'icon' => 'dumbbell'],
                    ['title' => 'Apparel', 'description' => 'Performance wear and team kits', 'icon' => 'shirt'],
                    ['title' => 'Accessories', 'description' => 'Bags, bottles, guards, and more', 'icon' => 'package'],
                ],
                'footer_note' => 'Online storefront launching soon.',
            ],
            [
                'slug' => 'tours',
                'nav_label' => 'EVOKE Tours',
                'sort_order' => 3,
                'badge' => 'EVOKE Tours',
                'title' => 'Journeys worth remembering',
                'description' => 'From serene domestic retreats to international adventures — every trip crafted with care.',
                'icon' => 'plane',
                'accent_style' => 'orange',
                'home_gradient' => 'from-orange-600 to-rose-700',
                'highlight_cards' => [
                    ['title' => 'Domestic Escapes', 'description' => 'Weekend getaways and cultural tours across India', 'icon' => 'compass'],
                    ['title' => 'International', 'description' => 'Curated global destinations with premium stays', 'icon' => 'globe'],
                    ['title' => 'Adventure', 'description' => 'Trekking, diving, and adrenaline experiences', 'icon' => 'mountain'],
                ],
                'footer_note' => 'Package booking portal coming soon.',
            ],
        ];

        foreach ($pages as $index => $page) {
            DB::table('division_page_settings')->updateOrInsert(
                ['slug' => $page['slug']],
                [
                    'nav_label' => $page['nav_label'],
                    'sort_order' => $page['sort_order'] ?? ($index + 1),
                    'show_in_nav' => true,
                    'badge' => $page['badge'],
                    'title' => $page['title'],
                    'description' => $page['description'],
                    'icon' => $page['icon'],
                    'accent_style' => $page['accent_style'],
                    'home_gradient' => $page['home_gradient'],
                    'highlight_cards' => json_encode($page['highlight_cards']),
                    'footer_note' => $page['footer_note'],
                    'meta' => json_encode(['sections' => []]),
                    'is_active' => true,
                    'updated_at' => now(),
                ],
            );
        }
    }
}
