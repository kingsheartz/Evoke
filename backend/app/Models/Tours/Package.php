<?php

namespace App\Models\Tours;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use SoftDeletes;

    protected $table = 'tour_packages';

    protected $fillable = [
        'title', 'slug', 'description', 'destination', 'type', 'duration_days',
        'price', 'gallery', 'inclusions', 'exclusions', 'is_custom', 'is_active',
        'is_featured', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'gallery' => 'array',
            'inclusions' => 'array',
            'exclusions' => 'array',
            'is_custom' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function itineraryDays(): HasMany
    {
        return $this->hasMany(ItineraryDay::class, 'package_id')->orderBy('day_number');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'package_id');
    }
}
