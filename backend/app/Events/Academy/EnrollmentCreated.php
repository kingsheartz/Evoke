<?php

namespace App\Events\Academy;

use App\Models\Academy\Enrollment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EnrollmentCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public Enrollment $enrollment) {}
}
