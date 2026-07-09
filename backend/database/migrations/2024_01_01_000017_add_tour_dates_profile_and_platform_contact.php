<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->date('available_from')->nullable()->after('duration_days');
            $table->date('available_until')->nullable()->after('available_from');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('evoke_id', 32)->nullable()->unique()->after('id');
            $table->string('gender', 32)->nullable()->after('phone');
            $table->unsignedSmallInteger('age')->nullable()->after('gender');
            $table->string('blood_group', 8)->nullable()->after('age');
            $table->string('learning_mode', 16)->nullable()->after('blood_group');
        });

        $year = now()->format('Y');
        $users = \Illuminate\Support\Facades\DB::table('users')->whereNull('evoke_id')->orderBy('id')->get();
        foreach ($users as $user) {
            \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $user->id)
                ->update(['evoke_id' => sprintf('EVK-%s-%05d', $year, $user->id)]);
        }
    }

    public function down(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->dropColumn(['available_from', 'available_until']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['evoke_id', 'gender', 'age', 'blood_group', 'learning_mode']);
        });
    }
};
