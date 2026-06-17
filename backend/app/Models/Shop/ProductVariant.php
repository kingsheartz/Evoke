<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $table = 'shop_product_variants';

    protected $fillable = [
        'product_id', 'sku', 'name', 'price', 'stock', 'options',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'options' => 'array',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
