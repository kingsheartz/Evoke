<?php

namespace App\Models\Newsletter;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'status',
        'unsubscribe_token',
        'subscribed_at',
        'unsubscribed_at',
    ];

    protected function casts(): array
    {
        return [
            'subscribed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    public static function subscribeEmail(string $email): self
    {
        $normalized = strtolower(trim($email));

        $existing = self::query()->where('email', $normalized)->first();
        if ($existing !== null) {
            if ($existing->status === 'unsubscribed') {
                $existing->update([
                    'status' => 'active',
                    'subscribed_at' => now(),
                    'unsubscribed_at' => null,
                ]);
            }

            return $existing->fresh();
        }

        return self::create([
            'email' => $normalized,
            'status' => 'active',
            'unsubscribe_token' => (string) Str::uuid(),
            'subscribed_at' => now(),
        ]);
    }

    public function unsubscribe(): void
    {
        $this->update([
            'status' => 'unsubscribed',
            'unsubscribed_at' => now(),
        ]);
    }
}
