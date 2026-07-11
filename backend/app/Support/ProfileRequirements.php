<?php

namespace App\Support;

use App\Models\User;

class ProfileRequirements
{
    /** @return list<string> */
    public static function missingForCourseOrTravel(User $user): array
    {
        $missing = [];

        if (! filled($user->gender)) {
            $missing[] = 'gender';
        }
        if (! filled($user->date_of_birth)) {
            $missing[] = 'date_of_birth';
        }
        if (! filled($user->blood_group)) {
            $missing[] = 'blood_group';
        }
        if (! filled($user->learning_mode)) {
            $missing[] = 'learning_mode';
        }

        return $missing;
    }

    public static function isCompleteForCourseOrTravel(User $user): bool
    {
        return self::missingForCourseOrTravel($user) === [];
    }

    public static function courseOrTravelMessage(User $user): ?string
    {
        $missing = self::missingForCourseOrTravel($user);
        if ($missing === []) {
            return null;
        }

        $labels = [
            'gender' => 'gender',
            'date_of_birth' => 'date of birth',
            'blood_group' => 'blood group',
            'learning_mode' => 'offline/online mode',
        ];

        $fields = array_map(fn ($key) => $labels[$key] ?? $key, $missing);

        return 'Complete your profile ('.implode(', ', $fields).') before enrolling or booking travel.';
    }
}
