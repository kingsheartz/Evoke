<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Platform
            'platform.manage',
            'modules.manage',
            'branches.manage',
            'users.manage',
            'analytics.view',
            'audit.view',
            // CMS
            'cms.pages.manage',
            'cms.sections.manage',
            'cms.blogs.manage',
            'cms.events.manage',
            'cms.promotions.manage',
            'cms.homepage.manage',
            // Academy
            'academy.categories.manage',
            'academy.courses.manage',
            'academy.trainers.manage',
            'academy.batches.manage',
            'academy.enrollments.manage',
            'academy.attendance.manage',
            'academy.certificates.manage',
            // Shop
            'shop.products.manage',
            'shop.orders.manage',
            'shop.inventory.manage',
            'shop.coupons.manage',
            // Tours
            'tours.packages.manage',
            'tours.bookings.manage',
            'tours.enquiries.manage',
            // Notifications
            'notifications.manage',
            'notifications.templates.manage',
            // AI
            'ai.manage',
            'ai.chat.use',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $roles = [
            'super-admin' => $permissions,
            'academy-manager' => [
                'academy.categories.manage', 'academy.courses.manage', 'academy.trainers.manage',
                'academy.batches.manage', 'academy.enrollments.manage', 'academy.attendance.manage',
                'academy.certificates.manage', 'analytics.view', 'cms.homepage.manage',
            ],
            'shop-manager' => [
                'shop.products.manage', 'shop.orders.manage', 'shop.inventory.manage',
                'shop.coupons.manage', 'analytics.view',
            ],
            'travel-manager' => [
                'tours.packages.manage', 'tours.bookings.manage', 'tours.enquiries.manage',
                'analytics.view',
            ],
            'trainer' => [
                'academy.attendance.manage', 'academy.enrollments.manage',
            ],
            'customer' => [
                'ai.chat.use',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($rolePermissions);
        }
    }
}
