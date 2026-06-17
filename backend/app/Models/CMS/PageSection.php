<?php

namespace App\Models\CMS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageSection extends Model
{
    protected $table = 'cms_page_sections';

    protected $fillable = [
        'page_id', 'section_key', 'component_type', 'content', 'sort_order', 'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_visible' => 'boolean',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id');
    }
}
