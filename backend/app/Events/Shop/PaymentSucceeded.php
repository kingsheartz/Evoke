<?php

namespace App\Events\Shop;

use App\Models\Shop\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentSucceeded
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Order $order,
        public float $amount,
    ) {}
}
