<?php

namespace Database\Seeders;

use App\Models\Academy\Category;
use Illuminate\Database\Seeder;

class AcademyCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Karate', 'slug' => 'karate', 'sort_order' => 1],
            ['name' => 'Yoga', 'slug' => 'yoga', 'sort_order' => 2],
            ['name' => 'Swimming', 'slug' => 'swimming', 'sort_order' => 3],
            ['name' => 'Indoor Sports', 'slug' => 'indoor-sports', 'sort_order' => 4],
            ['name' => 'Arts & Crafts', 'slug' => 'arts-crafts', 'sort_order' => 5],
            ['name' => 'Dance', 'slug' => 'dance', 'sort_order' => 6],
            ['name' => 'Fitness Programs', 'slug' => 'fitness', 'sort_order' => 7],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['is_active' => true])
            );
        }
    }
}
