<?php

namespace App\Support;

use Illuminate\Validation\Rule;

class UserValidation
{
    public static function normalizePhone(mixed $phone): ?string
    {
        if ($phone === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $phone);

        return $digits === '' ? null : $digits;
    }

    /** @return array<int, mixed> */
    public static function emailRules(?int $ignoreUserId = null, bool $required = true): array
    {
        $unique = Rule::unique('users', 'email')->whereNull('deleted_at');
        if ($ignoreUserId !== null) {
            $unique->ignore($ignoreUserId);
        }

        $rules = ['email', 'max:255', $unique];
        array_unshift($rules, $required ? 'required' : 'sometimes');

        return $rules;
    }

    /** @return array<int, mixed> */
    public static function phoneRules(?int $ignoreUserId = null): array
    {
        $unique = Rule::unique('users', 'phone')->whereNull('deleted_at');
        if ($ignoreUserId !== null) {
            $unique->ignore($ignoreUserId);
        }

        return ['nullable', 'string', 'regex:/^\d+$/', 'max:20', $unique];
    }
}
