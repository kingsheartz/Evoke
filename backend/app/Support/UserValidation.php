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

        $trimmed = trim((string) $phone);

        return $trimmed === '' ? null : $trimmed;
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

        return ['nullable', 'string', 'max:20', $unique];
    }
}
