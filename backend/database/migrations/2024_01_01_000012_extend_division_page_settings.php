<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('division_page_settings', function (Blueprint $table) {
            $table->string('nav_label')->nullable()->after('slug');
            $table->unsignedInteger('sort_order')->default(0)->after('nav_label');
            $table->boolean('show_in_nav')->default(true)->after('sort_order');
            $table->string('accent_style', 32)->default('accent')->after('icon');
            $table->string('home_gradient')->nullable()->after('accent_style');
        });
    }

    public function down(): void
    {
        Schema::table('division_page_settings', function (Blueprint $table) {
            $table->dropColumn(['nav_label', 'sort_order', 'show_in_nav', 'accent_style', 'home_gradient']);
        });
    }
};
