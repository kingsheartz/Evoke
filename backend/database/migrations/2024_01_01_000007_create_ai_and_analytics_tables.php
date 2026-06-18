<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $isPgsql = Schema::getConnection()->getDriverName() === 'pgsql';

        if ($isPgsql) {
            DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
        }

        Schema::create('ai_knowledge_chunks', function (Blueprint $table) use ($isPgsql) {
            $table->id();
            $table->string('source_type');
            $table->unsignedBigInteger('source_id');
            $table->string('module');
            $table->text('content');
            $table->json('metadata')->nullable();
            if (! $isPgsql) {
                // MySQL / MariaDB: JSON store for embeddings (AI vector search requires PostgreSQL)
                $table->json('embedding')->nullable();
            }
            $table->timestamps();
            $table->index(['source_type', 'source_id']);
            $table->index('module');
        });

        if ($isPgsql) {
            DB::statement('ALTER TABLE ai_knowledge_chunks ADD COLUMN embedding vector(768)');
        }

        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type');
            $table->string('module')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['event_type', 'created_at']);
        });

        Schema::create('search_index', function (Blueprint $table) {
            $table->id();
            $table->string('indexable_type');
            $table->unsignedBigInteger('indexable_id');
            $table->string('module');
            $table->string('title');
            $table->text('content');
            $table->string('url')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['indexable_type', 'indexable_id']);
            $table->index('module');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_index');
        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('ai_knowledge_chunks');
    }
};
