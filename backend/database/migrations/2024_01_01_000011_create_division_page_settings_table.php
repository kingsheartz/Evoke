<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('division_page_settings', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 32)->unique();
            $table->string('badge');
            $table->string('title');
            $table->text('description');
            $table->string('icon', 64)->default('graduation-cap');
            $table->json('highlight_cards')->nullable();
            $table->string('footer_note')->nullable();
            $table->json('meta')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('division_page_settings');
    }
};
