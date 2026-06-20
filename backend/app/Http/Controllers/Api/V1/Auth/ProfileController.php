<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Support\ImageNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'data' => $user->fresh()->load('roles', 'permissions', 'branch'),
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ImageNormalizer::validationRules(2048),
        ]);

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        try {
            $path = ImageNormalizer::store($request->file('avatar'), 'avatars/'.$user->id);
        } catch (\RuntimeException $e) {
            abort(422, $e->getMessage());
        }
        $user->update(['avatar' => $path]);

        return response()->json([
            'data' => $user->fresh()->load('roles', 'permissions', 'branch'),
        ]);
    }

    public function removeAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return response()->json([
            'data' => $user->fresh()->load('roles', 'permissions', 'branch'),
        ]);
    }
}
