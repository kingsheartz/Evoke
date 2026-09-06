<?php

namespace App\Console\Commands;

use App\Support\DatabaseReseed;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Console\Command;

class ReseedDatabaseCommand extends Command
{
    protected $signature = 'db:reseed
                            {--fresh : Drop all tables and migrate — removes users too}
                            {--force : Skip confirmation prompt}';

    protected $description = 'Reset demo/catalog data and re-run seeders while keeping users';

    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm('Reset catalog, CMS, orders, and settings? Users are kept.', false)) {
            $this->components->warn('Cancelled.');

            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            $this->components->warn('Running migrate:fresh --seed — all users will be removed.');
            $this->call('migrate:fresh', ['--seed' => true, '--force' => true]);

            return self::SUCCESS;
        }

        $this->components->info('Clearing content tables (users, roles, and tokens are kept)…');
        DatabaseReseed::truncateContentTables();

        $this->components->info('Seeding demo data…');
        $this->call(DemoDataSeeder::class);

        $this->components->info('Done. User accounts were not modified.');

        return self::SUCCESS;
    }
}
