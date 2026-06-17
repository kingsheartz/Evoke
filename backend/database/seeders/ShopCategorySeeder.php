<?php

namespace Database\Seeders;

use App\Models\Shop\Category;
use Illuminate\Database\Seeder;

class ShopCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Sports Equipment', 'slug' => 'sports-equipment', 'sort_order' => 1],
            ['name' => 'Sports Wear', 'slug' => 'sports-wear', 'sort_order' => 2],
            ['name' => 'Fitness Accessories', 'slug' => 'fitness-accessories', 'sort_order' => 3],
            ['name' => 'Academy Merchandise', 'slug' => 'academy-merchandise', 'sort_order' => 4],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['is_active' => true])
            );
        }
    }
}
