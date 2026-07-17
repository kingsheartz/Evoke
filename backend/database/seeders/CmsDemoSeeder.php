<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CmsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedBrand();
        $this->seedTestimonials();
        $this->seedHomepageExtras();
        $this->seedDivisionExtras();
    }

    private function seedBrand(): void
    {
        DB::table('platform_settings')->updateOrInsert(
            ['key' => 'brand'],
            [
                'value' => json_encode([
                    'site_name' => 'EOKE Groups',
                    'tagline' => 'Where dreams meet reality',
                    'logo_url' => null,
                    'logo_dark_url' => null,
                    'favicon_url' => null,
                ]),
                'updated_at' => now(),
            ],
        );
    }

    private function seedTestimonials(): void
    {
        $items = [
            ['name' => 'Ananya R.', 'role' => 'Karate parent', 'content' => 'EVOKE Academy transformed my daughter\'s confidence. The coaches are patient and professional.', 'rating' => 5, 'module' => 'academy'],
            ['name' => 'Rohit K.', 'role' => 'Shop customer', 'content' => 'Quality gear at fair prices — my go-to for training equipment.', 'rating' => 5, 'module' => 'shop'],
            ['name' => 'Meera S.', 'role' => 'Tour traveller', 'content' => 'Our Kerala trip was flawlessly organised. Every detail felt considered.', 'rating' => 5, 'module' => 'tours'],
            ['name' => 'Dev P.', 'role' => 'Swimming student', 'content' => 'From water fear to lap swimming in six weeks. Incredible instructors.', 'rating' => 5, 'module' => 'academy'],
            ['name' => 'Sneha M.', 'role' => 'Yoga member', 'content' => 'Morning classes set the tone for my whole week. Calm, challenging, welcoming.', 'rating' => 5, 'module' => 'academy'],
            ['name' => 'Arjun V.', 'role' => 'Adventure traveller', 'content' => 'Ladakh with EVOKE Tours was the trip of a lifetime. Safe, scenic, well-paced.', 'rating' => 5, 'module' => 'tours'],
        ];

        foreach ($items as $i => $item) {
            DB::table('cms_testimonials')->updateOrInsert(
                ['name' => $item['name'], 'content' => $item['content']],
                [
                    'role' => $item['role'],
                    'rating' => $item['rating'],
                    'module' => $item['module'],
                    'avatar' => \Database\Seeders\Support\DemoImages::person($i),
                    'is_featured' => $i < 4,
                    'is_active' => true,
                    'sort_order' => $i,
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );
        }
    }

    private function seedHomepageExtras(): void
    {
        $row = DB::table('homepage_settings')->where('is_active', true)->first();
        if (! $row) {
            return;
        }

        $meta = json_decode($row->meta ?? '{}', true);
        if (! is_array($meta)) {
            $meta = [];
        }

        $meta['sections'] = [
            [
                'id' => 'demo-testimonials',
                'component_type' => 'testimonials',
                'is_visible' => true,
                'sort_order' => 0,
                'content' => [
                    'heading' => 'What our community says',
                    'body' => 'Athletes, travellers, and families who chose EOKE.',
                    'items' => [
                        ['author' => 'Ananya R.', 'role' => 'Academy parent', 'quote' => 'Coaches who genuinely care about progress.'],
                        ['author' => 'Rohit K.', 'role' => 'EOKE Sports customer', 'quote' => 'Gear that lasts season after season.'],
                        ['author' => 'Meera S.', 'role' => 'EVOKE Tours guest', 'quote' => 'Travel that felt personal, not packaged.'],
                    ],
                ],
            ],
            [
                'id' => 'demo-contact',
                'component_type' => 'forms',
                'is_visible' => true,
                'sort_order' => 1,
                'content' => [
                    'heading' => 'Get in touch',
                    'body' => 'Questions about academy, shop, or tours? Send us a message.',
                    'submit_label' => 'Send message',
                    'contact_email' => 'evokeacademy@gmail.com',
                    'fields' => [
                        ['label' => 'Name', 'type' => 'text', 'required' => true],
                        ['label' => 'Email', 'type' => 'email', 'required' => true],
                        ['label' => 'Message', 'type' => 'textarea', 'required' => true],
                    ],
                ],
            ],
        ];

        DB::table('homepage_settings')->where('id', $row->id)->update([
            'meta' => json_encode($meta),
            'updated_at' => now(),
        ]);
    }

    private function seedDivisionExtras(): void
    {
        $extras = [
            'academy' => [
                [
                    'id' => 'academy-faq',
                    'component_type' => 'faq',
                    'is_visible' => true,
                    'sort_order' => 0,
                    'content' => [
                        'heading' => 'Academy FAQ',
                        'style' => 'details',
                        'items' => [
                            ['question' => 'How do I enroll?', 'answer' => 'Browse courses, pick a batch, and complete checkout online.'],
                            ['question' => 'Are trials available?', 'answer' => 'Contact us for a trial class on select programs.'],
                        ],
                    ],
                ],
            ],
            'shop' => [
                [
                    'id' => 'shop-faq',
                    'component_type' => 'faq',
                    'is_visible' => true,
                    'sort_order' => 0,
                    'content' => [
                        'heading' => 'Shopping FAQ',
                        'style' => 'details',
                        'items' => [
                            ['question' => 'Delivery time?', 'answer' => 'Most orders ship within 2–5 business days across India.'],
                            ['question' => 'Returns?', 'answer' => 'Unused items in original packaging may be returned within 30 days.'],
                        ],
                    ],
                ],
            ],
            'tours' => [
                [
                    'id' => 'tours-faq',
                    'component_type' => 'faq',
                    'is_visible' => true,
                    'sort_order' => 0,
                    'content' => [
                        'heading' => 'Travel FAQ',
                        'style' => 'details',
                        'items' => [
                            ['question' => 'Can I customise a trip?', 'answer' => 'Yes — choose a custom package or enquire for a bespoke itinerary.'],
                            ['question' => 'What is included?', 'answer' => 'Inclusions vary by package; see each tour detail page.'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($extras as $slug => $sections) {
            $row = DB::table('division_page_settings')->where('slug', $slug)->first();
            if (! $row) {
                continue;
            }

            $meta = json_decode($row->meta ?? '{}', true);
            if (! is_array($meta)) {
                $meta = [];
            }
            $meta['sections'] = $sections;

            DB::table('division_page_settings')->where('slug', $slug)->update([
                'meta' => json_encode($meta),
                'updated_at' => now(),
            ]);
        }
    }
}
