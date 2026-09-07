<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Application\Auth\Services\AccountDeletionService;
use App\Application\Auth\Services\FirebaseAuthService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\DeleteAccountRequest;
use App\Http\Requests\Auth\FirebaseLoginRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    /** Register a customer account and return a Sanctum bearer token. */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'password' => $request->validated('password'),
        ]);

        $user->assignRole('customer');

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->load('roles'),
                'token' => $token,
            ],
        ], 201);
    }

    /** Authenticate with email/password and return a Sanctum bearer token. */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! is_string($user->password) || $user->password === '' || ! Hash::check($request->validated('password'), $user->password)) {
            if ($user && (! is_string($user->password) || $user->password === '')) {
                return response()->json(['message' => 'This account uses Google sign-in.'], 422);
            }

            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->forAuthResponse(),
                'token' => $token,
            ],
        ]);
    }

    /** Exchange a verified Firebase ID token for a Sanctum bearer token. */
    public function firebase(FirebaseLoginRequest $request, FirebaseAuthService $firebaseAuth): JsonResponse
    {
        try {
            $result = $firebaseAuth->authenticate($request->validated('id_token'));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }

        return response()->json([
            'data' => $result,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->forAuthResponse(),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        Password::sendResetLink($request->only('email'));

        return response()->json(['message' => 'Password reset link sent if account exists.']);
    }

    /** Soft-delete the signed-in customer account and remove linked Firebase Auth user. */
    public function destroyAccount(DeleteAccountRequest $request, AccountDeletionService $accountDeletion): JsonResponse
    {
        $user = $request->user();
        abort_if($user === null, 401);

        $accountDeletion->deleteAccount(
            $user,
            $request->validated('email'),
            $request->validated('password'),
        );

        return response()->json(['message' => 'Your account has been deleted.']);
    }
}
