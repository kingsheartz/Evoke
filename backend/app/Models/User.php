<?php

namespace App\Models;

use App\Support\EvokeIdGenerator;
use App\Support\MediaStorage;
use App\Support\UserValidation;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'avatar',
        'evoke_id',
        'gender',
        'date_of_birth',
        'age',
        'blood_group',
        'learning_mode',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country',
        'branch_id',
        'two_factor_secret',
        'two_factor_enabled',
        'email_verified_at',
        'phone_verified_at',
    ];

    protected $appends = ['avatar_url'];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $user): void {
            if (! filled($user->evoke_id)) {
                $user->evoke_id = EvokeIdGenerator::generate();
            }
        });

        static::deleting(function (self $user): void {
            if ($user->isForceDeleting()) {
                return;
            }

            $user->email = self::scrubUniqueValue($user->email, $user->id);
            if ($user->phone) {
                $user->phone = self::scrubUniqueValue($user->phone, $user->id);
            }
            $user->saveQuietly();
        });
    }

    protected function phone(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value) => UserValidation::normalizePhone($value),
        );
    }

    private static function scrubUniqueValue(string $value, int $userId): string
    {
        $suffix = ".deleted.{$userId}";

        if (str_ends_with($value, $suffix)) {
            return $value;
        }

        return $value.$suffix;
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /** Include role-derived permissions in API auth/profile payloads. */
    public function forAuthResponse(): self
    {
        $this->loadMissing('roles', 'branch');
        $this->setRelation('permissions', $this->getAllPermissions());

        return $this;
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::get(fn () => MediaStorage::url($this->avatar));
    }
}
