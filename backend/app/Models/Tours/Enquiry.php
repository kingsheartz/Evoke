<?php

namespace App\Models\Tours;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enquiry extends Model
{
    protected $table = 'tour_enquiries';

    protected $fillable = [
        'package_id', 'name', 'email', 'phone', 'travelers_count',
        'preferred_date', 'message', 'status', 'assigned_to',
    ];

    protected function casts(): array
    {
        return ['preferred_date' => 'date'];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
