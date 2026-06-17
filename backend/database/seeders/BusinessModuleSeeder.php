<?php

namespace Database\Seeders;

use App\Models\BusinessModule;
use Illuminate\Database\Seeder;

class BusinessModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            ['slug' => 'academy', 'name' => 'Evoke Academy', 'description' => 'Courses, trainers, enrollments', 'sort_order' => 1],
            ['slug' => 'shop', 'name' => 'Evoke Sports Shop', 'description' => 'E-commerce for sports equipment', 'sort_order' => 2],
            ['slug' => 'tours', 'name' => 'Evoke Tours & Travels', 'description' => 'Travel packages and bookings', 'sort_order' => 3],
            ['slug' => 'cms', 'name' => 'CMS', 'description' => 'Content management system', 'sort_order' => 0],
            ['slug' => 'notifications', 'name' => 'Notifications', 'description' => 'Centralized notification engine', 'sort_order' => 4],
            ['slug' => 'ai', 'name' => 'AI Assistant', 'description' => 'RAG-powered chatbot', 'sort_order' => 5, 'is_enabled' => false],
        ];

        foreach ($modules as $module) {
            BusinessModule::firstOrCreate(
                ['slug' => $module['slug']],
                array_merge(['is_enabled' => true], $module)
            );
        }
    }
}
