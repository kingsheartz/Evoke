<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->json('related_slugs')->nullable()->after('is_featured');
        });

        Schema::table('shop_products', function (Blueprint $table) {
            $table->json('related_slugs')->nullable()->after('is_featured');
        });

        Schema::table('academy_courses', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('requires_approval');
            $table->json('related_slugs')->nullable()->after('is_featured');
        });
    }

    public function down(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->dropColumn('related_slugs');
        });

        Schema::table('shop_products', function (Blueprint $table) {
            $table->dropColumn('related_slugs');
        });

        Schema::table('academy_courses', function (Blueprint $table) {
            $table->dropColumn(['is_featured', 'related_slugs']);
        });
    }
};
