<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $table = 'shop_coupons';

    protected $fillable = [
        'code', 'type', 'value', 'min_order_amount', 'usage_limit',
        'used_count', 'starts_at', 'expires_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
