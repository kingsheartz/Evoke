<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academy_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('academy_trainers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('bio')->nullable();
            $table->json('certifications')->nullable();
            $table->json('specializations')->nullable();
            $table->string('photo')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('academy_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('academy_categories');
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('duration')->nullable();
            $table->decimal('fees', 10, 2)->default(0);
            $table->string('thumbnail')->nullable();
            $table->json('gallery')->nullable();
            $table->string('status')->default('draft');
            $table->boolean('requires_approval')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('academy_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('academy_courses')->cascadeOnDelete();
            $table->foreignId('trainer_id')->nullable()->constrained('academy_trainers')->nullOnDelete();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->unsignedSmallInteger('capacity')->default(20);
            $table->json('schedule')->nullable();
            $table->string('status')->default('upcoming');
            $table->timestamps();
        });

        Schema::create('academy_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('academy_batches')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('payment_status')->default('unpaid');
            $table->string('payment_reference')->nullable();
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'batch_id']);
        });

        Schema::create('academy_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('academy_enrollments')->cascadeOnDelete();
            $table->date('date');
            $table->string('status')->default('present');
            $table->string('method')->default('manual');
            $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['enrollment_id', 'date']);
        });

        Schema::create('academy_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('academy_enrollments')->cascadeOnDelete();
            $table->string('certificate_number')->unique();
            $table->string('file_path')->nullable();
            $table->timestamp('issued_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academy_certificates');
        Schema::dropIfExists('academy_attendance');
        Schema::dropIfExists('academy_enrollments');
        Schema::dropIfExists('academy_batches');
        Schema::dropIfExists('academy_courses');
        Schema::dropIfExists('academy_trainers');
        Schema::dropIfExists('academy_categories');
    }
};
