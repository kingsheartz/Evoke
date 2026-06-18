<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class DatabaseCompatibility
{
    public static function driver(): string
    {
        return DB::connection()->getDriverName();
    }

    public static function isPgsql(): bool
    {
        return self::driver() === 'pgsql';
    }

    public static function isMysql(): bool
    {
        return self::driver() === 'mysql';
    }

    /** PostgreSQL ilike; MySQL like (utf8mb4_unicode_ci is case-insensitive). */
    public static function likeOperator(): string
    {
        return self::isPgsql() ? 'ilike' : 'like';
    }
}
