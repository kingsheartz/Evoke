<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class DatabaseReseed
{
    /** Tables cleared before demo seed — users, roles, tokens, and branches are kept. */
    private const CONTENT_TABLES = [
        'shop_order_items',
        'shop_orders',
        'shop_cart_items',
        'shop_carts',
        'shop_wishlists',
        'shop_product_variants',
        'shop_products',
        'shop_coupons',
        'shop_categories',
        'academy_certificates',
        'academy_attendance',
        'academy_enrollments',
        'academy_batches',
        'academy_courses',
        'academy_trainers',
        'academy_categories',
        'tour_enquiries',
        'tour_bookings',
        'tour_itinerary_days',
        'tour_packages',
        'cms_page_sections',
        'cms_pages',
        'cms_testimonials',
        'cms_events',
        'cms_promotions',
        'cms_galleries',
        'homepage_settings',
        'division_page_settings',
        'platform_settings',
        'notification_logs',
        'notifications',
        'notification_templates',
        'notification_preferences',
        'admin_tasks',
        'audit_logs',
        'analytics_events',
        'search_index',
        'ai_knowledge_chunks',
    ];

    public static function truncateContentTables(): void
    {
        $driver = DB::connection()->getDriverName();
        $tables = array_values(array_filter(
            self::CONTENT_TABLES,
            static fn (string $table) => DB::getSchemaBuilder()->hasTable($table),
        ));

        if ($tables === []) {
            return;
        }

        if ($driver === 'pgsql') {
            $list = implode(', ', array_map(static fn (string $t) => '"'.$t.'"', $tables));
            DB::statement("TRUNCATE TABLE {$list} RESTART IDENTITY CASCADE");

            return;
        }

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            foreach ($tables as $table) {
                DB::table($table)->truncate();
            }
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            return;
        }

        foreach ($tables as $table) {
            DB::table($table)->delete();
        }
    }
}
