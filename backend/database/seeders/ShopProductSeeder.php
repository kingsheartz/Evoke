<?php

namespace Database\Seeders;

use App\Models\Shop\Category;
use App\Models\Shop\Product;
use Database\Seeders\Support\DemoImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ShopProductSeeder extends Seeder
{
    /** @var array<string, list<string>> */
    private const NAMES = [
        'sports-equipment' => [
            'Pro Cricket Bat — English Willow', 'Match Football Size 5', 'Badminton Racquet Carbon Pro',
            'Table Tennis Paddle Set', 'Adjustable Dumbbell Pair 20kg', 'Resistance Band Kit',
            'Yoga Mat 6mm Pro Grip', 'Jump Rope Speed Cable', 'Boxing Gloves 12oz', 'Swimming Goggles Anti-Fog',
            'Tennis Ball Can (3 pack)', 'Shuttlecock Feather Pro', 'Goalkeeper Gloves', 'Agility Ladder 6m',
        ],
        'sports-wear' => [
            'Performance Dry-Fit Tee', 'Training Shorts — Black', 'Compression Leggings', 'Track Jacket Lightweight',
            'Sports Bra High Support', 'Cricket Whites Set', 'Running Socks 3-Pack', 'Polo Team Shirt',
            'Warm-Up Hoodie', 'Cycling Jersey', 'Swim Trunks Quick Dry', 'Basketball Jersey',
            'Cap EOKE Sports', 'Windbreaker Jacket',
        ],
        'fitness-accessories' => [
            'Insulated Sports Bottle 750ml', 'Gym Duffel Bag', 'Wrist Support Wraps', 'Knee Support Sleeve',
            'Foam Roller Medium', 'Skipping Rope Weighted', 'Ankle Weights 2kg', 'Gym Towel Microfiber',
            'Headband Sweat Wicking', 'Fitness Tracker Band', 'Protein Shaker 600ml', 'Yoga Block Set',
            'Pull-Up Assist Band', 'Massage Ball Set',
        ],
        'academy-merchandise' => [
            'EVOKE Academy Training Tee', 'EOKE Academy Hoodie', 'Academy Drawstring Bag', 'EOKE Water Bottle',
            'Academy Cap Embroidered', 'EVOKE Karate Gi Belt Set', 'Academy Sticker Pack', 'EOKE Sports Socks',
        ],
    ];

    public function run(): void
    {
        $index = 0;

        foreach (self::NAMES as $categorySlug => $names) {
            $category = Category::where('slug', $categorySlug)->first();
            if (! $category) {
                continue;
            }

            foreach ($names as $i => $name) {
                $slug = Str::slug($name);
                $price = match ($categorySlug) {
                    'sports-equipment' => rand(899, 8999) + 0.99,
                    'sports-wear' => rand(499, 3499) + 0.99,
                    'fitness-accessories' => rand(199, 2499) + 0.99,
                    default => rand(299, 1999) + 0.99,
                };
                $compare = $price + rand(100, 800);

                Product::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $category->id,
                        'name' => $name,
                        'description' => "Premium {$name} from EOKE Sports. Built for training and match day — quality-tested by the Evoke team. Ships across India.",
                        'sku' => 'EOKE-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                        'price' => $price,
                        'compare_price' => $compare,
                        'stock' => rand(8, 120),
                        'images' => DemoImages::gallery('shop', $index, rand(2, 4)),
                        'attributes' => ['brand' => 'EOKE Sports', 'warranty' => '1 year'],
                        'is_active' => true,
                        'is_featured' => $i < 2 || rand(0, 5) === 0,
                        'seo_title' => "{$name} | EOKE Sports",
                        'seo_description' => "Shop {$name} at EOKE Sports — gear for athletes at every level.",
                    ],
                );

                $index++;
            }
        }

        // Pad to 50 products with numbered variants if categories were missing entries
        while ($index < 50) {
            $categories = Category::where('is_active', true)->orderBy('sort_order')->get();
            if ($categories->isEmpty()) {
                break;
            }
            $category = $categories[$index % $categories->count()];
            $name = "EOKE Training Essential ".($index + 1);
            $slug = Str::slug($name);

            Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category->id,
                    'name' => $name,
                    'description' => 'Versatile training essential from EOKE Sports. Durable materials and athlete-focused design.',
                    'sku' => 'EOKE-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                    'price' => rand(399, 2999) + 0.99,
                    'compare_price' => null,
                    'stock' => rand(10, 80),
                    'images' => [DemoImages::sports($index)],
                    'is_active' => true,
                    'is_featured' => false,
                ],
            );
            $index++;
        }
    }
}
