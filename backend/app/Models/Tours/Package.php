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
        'available_from', 'available_until',
        'price', 'gallery', 'inclusions', 'exclusions', 'is_custom', 'is_active',
        'is_featured', 'seo_title', 'seo_description', 'related_slugs',
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
            'related_slugs' => 'array',
            'available_from' => 'date',
            'available_until' => 'date',
        ];
    }

    public function itineraryDays(): HasMany
    {
        return $this->hasMany(ItineraryDay::class, 'package_id')->orderBy('day_number');
    }

    public function isTravelDateAllowed(string $travelDate): bool
    {
        if ($this->available_from && $travelDate < $this->available_from->toDateString()) {
            return false;
        }

        if ($this->available_until && $travelDate > $this->available_until->toDateString()) {
            return false;
        }

        return true;
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'package_id');
    }
}
