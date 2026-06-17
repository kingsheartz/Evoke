<?php

namespace App\Events\Tours;

use App\Models\Tours\Enquiry;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EnquiryReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(public Enquiry $enquiry) {}
}
