<?php

namespace App\Models\Academy;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trainer extends Model
{
    use SoftDeletes;

    protected $table = 'academy_trainers';

    protected $fillable = [
        'user_id', 'branch_id', 'name', 'slug', 'bio', 'certifications',
        'specializations', 'photo', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'certifications' => 'array',
            'specializations' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
