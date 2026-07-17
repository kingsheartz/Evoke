<?php

namespace Database\Seeders;

use App\Models\Tours\ItineraryDay;
use App\Models\Tours\Package;
use Database\Seeders\Support\DemoImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TourPackageSeeder extends Seeder
{
    /** @var list<array<string, mixed>> */
    private const PACKAGES = [
        ['title' => 'Goa Beach Escape', 'destination' => 'Goa, India', 'type' => 'domestic', 'days' => 4, 'price' => 18999],
        ['title' => 'Kerala Backwaters Retreat', 'destination' => 'Kerala, India', 'type' => 'domestic', 'days' => 5, 'price' => 24999],
        ['title' => 'Rajasthan Heritage Trail', 'destination' => 'Rajasthan, India', 'type' => 'domestic', 'days' => 6, 'price' => 32999],
        ['title' => 'Himachal Mountain Getaway', 'destination' => 'Manali, India', 'type' => 'domestic', 'days' => 5, 'price' => 21999],
        ['title' => 'Andaman Island Explorer', 'destination' => 'Andaman, India', 'type' => 'domestic', 'days' => 6, 'price' => 38999],
        ['title' => 'Ladakh High-Altitude Adventure', 'destination' => 'Ladakh, India', 'type' => 'adventure', 'days' => 7, 'price' => 45999],
        ['title' => 'Rishikesh Raft & Yoga', 'destination' => 'Rishikesh, India', 'type' => 'adventure', 'days' => 4, 'price' => 16999],
        ['title' => 'Meghalaya Living Root Bridges', 'destination' => 'Meghalaya, India', 'type' => 'adventure', 'days' => 5, 'price' => 27999],
        ['title' => 'Bangkok & Pattaya Highlights', 'destination' => 'Thailand', 'type' => 'international', 'days' => 5, 'price' => 54999],
        ['title' => 'Bali Culture & Coast', 'destination' => 'Bali, Indonesia', 'type' => 'international', 'days' => 6, 'price' => 62999],
        ['title' => 'Dubai City & Desert Safari', 'destination' => 'UAE', 'type' => 'international', 'days' => 4, 'price' => 58999],
        ['title' => 'Singapore Family Fun', 'destination' => 'Singapore', 'type' => 'international', 'days' => 5, 'price' => 71999],
        ['title' => 'Sri Lanka Heritage Loop', 'destination' => 'Sri Lanka', 'type' => 'international', 'days' => 7, 'price' => 49999],
        ['title' => 'Vietnam North to South', 'destination' => 'Vietnam', 'type' => 'international', 'days' => 8, 'price' => 67999],
        ['title' => 'Swiss Alps Scenic Rail', 'destination' => 'Switzerland', 'type' => 'international', 'days' => 7, 'price' => 189999],
        ['title' => 'Paris & Amsterdam Art Cities', 'destination' => 'Europe', 'type' => 'international', 'days' => 8, 'price' => 159999],
        ['title' => 'Kenya Safari Experience', 'destination' => 'Kenya', 'type' => 'adventure', 'days' => 6, 'price' => 139999],
        ['title' => 'Custom Honeymoon — Your Way', 'destination' => 'Flexible', 'type' => 'domestic', 'days' => 5, 'price' => 0, 'custom' => true],
    ];

    public function run(): void
    {
        foreach (self::PACKAGES as $i => $row) {
            $slug = Str::slug($row['title']);
            $days = (int) $row['days'];
            $isCustom = (bool) ($row['custom'] ?? false);

            $package = Package::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $row['title'],
                    'description' => "Experience {$row['destination']} with EVOKE Tours — curated stays, guided experiences, and seamless logistics.",
                    'destination' => $row['destination'],
                    'type' => $row['type'],
                    'duration_days' => $days,
                    'available_from' => now()->toDateString(),
                    'available_until' => now()->addYear()->toDateString(),
                    'price' => $isCustom ? 0 : (float) $row['price'],
                    'gallery' => DemoImages::gallery('travel', $i, 4),
                    'inclusions' => ['Accommodation', 'Breakfast daily', 'Airport transfers', 'Evoke trip coordinator'],
                    'exclusions' => ['Flights', 'Personal expenses', 'Travel insurance'],
                    'is_custom' => $isCustom,
                    'is_active' => true,
                    'is_featured' => $i < 8,
                    'seo_title' => "{$row['title']} | EVOKE Tours",
                    'seo_description' => "Book {$row['title']} — {$days} days in {$row['destination']}.",
                ],
            );

            if ($isCustom) {
                continue;
            }

            for ($d = 1; $d <= min($days, 7); $d++) {
                ItineraryDay::updateOrCreate(
                    ['package_id' => $package->id, 'day_number' => $d],
                    [
                        'title' => "Day {$d}: ".match ($d) {
                            1 => 'Arrival & welcome',
                            2 => 'Sightseeing & culture',
                            3 => 'Adventure activity',
                            default => 'Explore & unwind',
                        },
                        'description' => "Guided experiences and curated free time on day {$d} of your {$row['destination']} journey.",
                        'activities' => ['Guided tour', 'Local cuisine experience'],
                        'accommodation' => 'Premium hotel / resort',
                        'meals' => ['Breakfast', $d % 2 === 0 ? 'Dinner' : null],
                    ],
                );
            }
        }
    }
}
