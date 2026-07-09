<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function permissions(): JsonResponse
    {
        $permissions = Permission::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->groupBy(fn ($permission) => explode('.', $permission->name)[0] ?? 'other')
            ->map(fn ($group, $section) => [
                'section' => $section,
                'permissions' => $group->values(),
            ])
            ->values();

        return response()->json(['data' => $permissions]);
    }

    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->with('permissions:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => $role->users()->count(),
            ]);

        return response()->json(['data' => $roles]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:64|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        abort_if($validated['name'] === 'super-admin', 422, 'Cannot create a super-admin role.');

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ],
        ], 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        abort_if($role->name === 'super-admin', 422, 'The super-admin role cannot be modified.');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:64|unique:roles,name,'.$role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        if (isset($validated['name'])) {
            $role->update(['name' => $validated['name']]);
        }

        if (array_key_exists('permissions', $validated)) {
            $role->syncPermissions($validated['permissions'] ?? []);
        }

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->fresh('permissions')->permissions->pluck('name'),
            ],
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        abort_if($role->name === 'super-admin', 422, 'The super-admin role cannot be deleted.');
        abort_if($role->users()->exists(), 422, 'Remove users from this role before deleting it.');

        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }
}
