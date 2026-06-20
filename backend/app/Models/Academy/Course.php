<?php

namespace App\Models\Academy;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;

    protected $table = 'academy_courses';

    protected $fillable = [
        'category_id', 'branch_id', 'title', 'slug', 'description', 'seo_title', 'seo_description',
        'duration', 'fees', 'thumbnail', 'gallery', 'status', 'requires_approval',
    ];

    protected function casts(): array
    {
        return [
            'fees' => 'decimal:2',
            'gallery' => 'array',
            'requires_approval' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'course_id');
    }
}
