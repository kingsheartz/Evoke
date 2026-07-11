<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\User;
use App\Support\ImageNormalizer;
use App\Support\UserValidation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sort = $request->input('sort', 'created_at');
        $dir = $request->input('dir', 'desc') === 'asc' ? 'asc' : 'desc';
        $allowedSort = ['created_at', 'name', 'email', 'updated_at'];
        if (! in_array($sort, $allowedSort, true)) {
            $sort = 'created_at';
        }

        $query = User::with('roles', 'branch')
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->whereLikeInsensitive('name', "%{$s}%")
                    ->orWhereLikeInsensitive('email', "%{$s}%")
                    ->orWhereLikeInsensitive('phone', "%{$s}%");
            }))
            ->when($request->role, fn ($q, $role) => $q->whereHas('roles', fn ($r) => $r->where('name', $role)))
            ->when($request->branch_id, fn ($q, $id) => $q->where('branch_id', $id))
            ->orderBy($sort, $dir);

        $paginated = $query->paginate($request->integer('per_page', 20));

        $stats = [
            'total' => User::count(),
            'by_role' => User::join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
                ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
                ->where('model_has_roles.model_type', User::class)
                ->selectRaw('roles.name as role, count(*) as count')
                ->groupBy('roles.name')
                ->pluck('count', 'role')
                ->toArray(),
        ];

        return response()->json(array_merge($paginated->toArray(), ['stats' => $stats]));
    }

    public function show(User $user): JsonResponse
    {
        $user->load('roles', 'branch', 'permissions');

        return response()->json(['data' => $user]);
    }

    public function branches(): JsonResponse
    {
        return response()->json([
            'data' => Branch::orderBy('name')->get(['id', 'name', 'city', 'country']),
        ]);
    }

    public function uploadAvatar(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'avatar' => ImageNormalizer::validationRules(2048),
        ]);

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        try {
            $path = ImageNormalizer::store($request->file('avatar'), 'avatars/'.$user->id);
        } catch (\RuntimeException $e) {
            abort(422, $e->getMessage());
        }
        $user->update(['avatar' => $path]);

        return response()->json(['data' => $user->fresh(['roles', 'branch', 'permissions'])]);
    }

    public function removeAvatar(User $user): JsonResponse
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return response()->json(['data' => $user->fresh(['roles', 'branch', 'permissions'])]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge([
            'phone' => UserValidation::normalizePhone($request->input('phone')),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => UserValidation::emailRules(),
            'phone' => UserValidation::phoneRules(),
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'branch_id' => 'nullable|exists:branches,id',
            'gender' => 'nullable|string|in:male,female,other,prefer_not_to_say',
            'date_of_birth' => 'nullable|date|before:today',
            'blood_group' => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'learning_mode' => 'nullable|string|in:offline,online',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
        ]);

        $role = $validated['role'];
        unset($validated['role']);

        $user = User::create([
            ...$validated,
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $user->assignRole($role);

        return response()->json(['data' => $user->load('roles', 'branch')], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if ($request->has('phone')) {
            $request->merge([
                'phone' => UserValidation::normalizePhone($request->input('phone')),
            ]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => UserValidation::emailRules($user->id, required: false),
            'phone' => UserValidation::phoneRules($user->id),
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|string|exists:roles,name',
            'branch_id' => 'nullable|exists:branches,id',
            'gender' => 'nullable|string|in:male,female,other,prefer_not_to_say',
            'date_of_birth' => 'nullable|date|before:today',
            'blood_group' => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'learning_mode' => 'nullable|string|in:offline,online',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if (array_key_exists('phone', $validated)) {
            $validated['phone'] = $validated['phone'] ?? null;
        }

        $role = $validated['role'] ?? null;
        unset($validated['role']);

        $user->update($validated);

        if ($role) {
            $user->syncRoles([$role]);
        }

        return response()->json(['data' => $user->fresh(['roles', 'branch'])]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->hasRole('super-admin') && User::role('super-admin')->count() <= 1) {
            return response()->json(['message' => 'Cannot delete the only super admin.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    public function roles(): JsonResponse
    {
        return response()->json(['data' => Role::orderBy('name')->pluck('name')]);
    }
}
