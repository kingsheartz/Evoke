<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessModule extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'description',
        'is_enabled',
        'sort_order',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'settings' => 'array',
        ];
    }
}
