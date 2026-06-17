<?php

namespace App\Models\Academy;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Enrollment extends Model
{
    protected $table = 'academy_enrollments';

    protected $fillable = [
        'user_id', 'batch_id', 'status', 'amount_paid', 'payment_status',
        'payment_reference', 'enrolled_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'enrolled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id');
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(Attendance::class, 'enrollment_id');
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class, 'enrollment_id');
    }
}
