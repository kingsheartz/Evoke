<?php

namespace Database\Seeders;

use App\Models\Academy\Batch;
use App\Models\Academy\Category;
use App\Models\Academy\Course;
use App\Models\Academy\Trainer;
use App\Models\Branch;
use Database\Seeders\Support\DemoImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AcademyDemoSeeder extends Seeder
{
    /** @var list<array{title: string, category: string, duration: string, fees: float, desc: string}> */
    private const COURSES = [
        ['title' => 'Karate — Beginner (Kids)', 'category' => 'karate', 'duration' => '3 months', 'fees' => 4500, 'desc' => 'Foundation stances, blocks, and discipline for ages 6–12.'],
        ['title' => 'Karate — Advanced Belt Prep', 'category' => 'karate', 'duration' => '6 months', 'fees' => 7200, 'desc' => 'Kata, kumite, and grading preparation with certified instructors.'],
        ['title' => 'Morning Hatha Yoga', 'category' => 'yoga', 'duration' => '8 weeks', 'fees' => 3800, 'desc' => 'Breath-led flows, mobility, and mindfulness for all levels.'],
        ['title' => 'Power Yoga & Strength', 'category' => 'yoga', 'duration' => '8 weeks', 'fees' => 4200, 'desc' => 'Dynamic sequences building core strength and flexibility.'],
        ['title' => 'Learn to Swim — Level 1', 'category' => 'swimming', 'duration' => '6 weeks', 'fees' => 5500, 'desc' => 'Water confidence, floating, and basic freestyle technique.'],
        ['title' => 'Swim Squad — Intermediate', 'category' => 'swimming', 'duration' => '12 weeks', 'fees' => 8900, 'desc' => 'Stroke refinement, endurance sets, and lane etiquette.'],
        ['title' => 'Table Tennis Fundamentals', 'category' => 'indoor-sports', 'duration' => '10 weeks', 'fees' => 3200, 'desc' => 'Grip, footwork, serve, and rally drills for beginners.'],
        ['title' => 'Badminton Skills Clinic', 'category' => 'indoor-sports', 'duration' => '10 weeks', 'fees' => 3600, 'desc' => 'Smash technique, net play, and match strategy.'],
        ['title' => 'Contemporary Dance — Youth', 'category' => 'dance', 'duration' => '12 weeks', 'fees' => 4800, 'desc' => 'Expression, rhythm, and choreography for teens.'],
        ['title' => 'Classical Bharatanatyam Intro', 'category' => 'dance', 'duration' => '16 weeks', 'fees' => 6200, 'desc' => 'Adavus, mudras, and traditional repertoire basics.'],
        ['title' => 'Creative Arts & Crafts', 'category' => 'arts-crafts', 'duration' => '8 weeks', 'fees' => 2800, 'desc' => 'Painting, collage, and craft projects for young learners.'],
        ['title' => 'Functional Fitness Bootcamp', 'category' => 'fitness', 'duration' => '6 weeks', 'fees' => 3900, 'desc' => 'HIIT, mobility, and strength circuits for adults.'],
        ['title' => 'Senior Wellness Yoga', 'category' => 'yoga', 'duration' => 'ongoing', 'fees' => 3000, 'desc' => 'Gentle movement, balance, and joint-friendly flows.'],
        ['title' => 'Competitive Karate Squad', 'category' => 'karate', 'duration' => '6 months', 'fees' => 9800, 'desc' => 'Tournament prep, conditioning, and advanced kumite.'],
    ];

    /** @var list<array{name: string, bio: string, specs: list<string>}> */
    private const TRAINERS = [
        ['name' => 'Sensei Arjun Mehta', 'bio' => 'Black belt instructor with 15+ years coaching karate and self-defence.', 'specs' => ['Karate', 'Self-defence']],
        ['name' => 'Coach Priya Nair', 'bio' => 'Certified swim coach and former state-level competitor.', 'specs' => ['Swimming', 'Aqua fitness']],
        ['name' => 'Yogi Rekha Sharma', 'bio' => 'RYT-500 yoga teacher specialising in Hatha and therapeutic yoga.', 'specs' => ['Yoga', 'Wellness']],
        ['name' => 'Coach Vikram Desai', 'bio' => 'Multi-sport indoor coach — table tennis, badminton, and fitness.', 'specs' => ['Indoor sports', 'Fitness']],
    ];

    public function run(): void
    {
        $branch = Branch::first();
        $trainers = [];

        foreach (self::TRAINERS as $i => $row) {
            $slug = Str::slug($row['name']);
            $trainers[] = Trainer::updateOrCreate(
                ['slug' => $slug],
                [
                    'branch_id' => $branch?->id,
                    'name' => $row['name'],
                    'bio' => $row['bio'],
                    'specializations' => $row['specs'],
                    'certifications' => ['Evoke Certified', 'First Aid'],
                    'photo' => DemoImages::person($i),
                    'is_active' => true,
                ],
            );
        }

        foreach (self::COURSES as $i => $row) {
            $category = Category::where('slug', $row['category'])->first();
            if (! $category) {
                continue;
            }

            $slug = Str::slug($row['title']);
            $thumb = DemoImages::academy($i);
            $gallery = DemoImages::gallery('academy', $i, 3);

            $course = Course::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category->id,
                    'branch_id' => $branch?->id,
                    'title' => $row['title'],
                    'description' => $row['desc'].' Enroll online through EVOKE Academy.',
                    'duration' => $row['duration'],
                    'fees' => $row['fees'],
                    'thumbnail' => $thumb,
                    'gallery' => $gallery,
                    'status' => 'published',
                    'requires_approval' => false,
                    'is_featured' => $i < 6,
                    'seo_title' => "{$row['title']} | EVOKE Academy",
                    'seo_description' => $row['desc'],
                ],
            );

            $trainer = $trainers[$i % count($trainers)] ?? null;
            Batch::updateOrCreate(
                [
                    'course_id' => $course->id,
                    'name' => 'Batch A — '.now()->format('M Y'),
                ],
                [
                    'trainer_id' => $trainer?->id,
                    'start_date' => now()->addDays(14)->toDateString(),
                    'end_date' => now()->addMonths(3)->toDateString(),
                    'capacity' => rand(15, 24),
                    'schedule' => ['days' => ['Mon', 'Wed', 'Fri'], 'time' => '6:00 PM – 7:30 PM'],
                    'status' => 'open',
                ],
            );
        }
    }
}
