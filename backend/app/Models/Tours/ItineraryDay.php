<?php

namespace App\Models\Tours;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItineraryDay extends Model
{
    protected $table = 'tour_itinerary_days';

    protected $fillable = [
        'package_id', 'day_number', 'title', 'description', 'activities',
        'accommodation', 'meals',
    ];

    protected function casts(): array
    {
        return [
            'activities' => 'array',
            'meals' => 'array',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }
}
