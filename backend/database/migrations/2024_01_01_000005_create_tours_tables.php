<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_packages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('destination');
            $table->string('type')->default('domestic');
            $table->unsignedSmallInteger('duration_days');
            $table->decimal('price', 10, 2);
            $table->json('gallery')->nullable();
            $table->json('inclusions')->nullable();
            $table->json('exclusions')->nullable();
            $table->boolean('is_custom')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tour_itinerary_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained('tour_packages')->cascadeOnDelete();
            $table->unsignedSmallInteger('day_number');
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('activities')->nullable();
            $table->string('accommodation')->nullable();
            $table->json('meals')->nullable();
            $table->timestamps();
            $table->unique(['package_id', 'day_number']);
        });

        Schema::create('tour_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('tour_packages');
            $table->date('travel_date');
            $table->unsignedSmallInteger('travelers_count')->default(1);
            $table->string('status')->default('pending');
            $table->string('payment_status')->default('unpaid');
            $table->string('payment_reference')->nullable();
            $table->decimal('total_amount', 10, 2);
            $table->json('traveler_details')->nullable();
            $table->text('special_requests')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tour_enquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->nullable()->constrained('tour_packages')->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->unsignedSmallInteger('travelers_count')->nullable();
            $table->date('preferred_date')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_enquiries');
        Schema::dropIfExists('tour_bookings');
        Schema::dropIfExists('tour_itinerary_days');
        Schema::dropIfExists('tour_packages');
    }
};
