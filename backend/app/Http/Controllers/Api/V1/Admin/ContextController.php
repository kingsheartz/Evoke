<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Shared\Contracts\ModuleRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContextController extends Controller
{
    public function __construct(
        private readonly ModuleRepositoryInterface $modules,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles', 'permissions', 'branch');

        $permissions = $user->getAllPermissions()->pluck('name')->values();
        $roles = $user->roles->pluck('name')->values();

        $navigation = $this->buildNavigation($permissions->all(), $this->modules->all());

        return response()->json([
            'data' => [
                'user' => $user,
                'roles' => $roles,
                'permissions' => $permissions,
                'modules' => $this->modules->all(),
                'navigation' => $navigation,
            ],
        ]);
    }

    /** @param array<int, string> $permissions */
    private function buildNavigation(array $permissions, array $modules): array
    {
        $enabled = collect($modules)->filter(fn ($m) => $m['enabled'])->pluck('slug')->all();
        $can = fn (string $p) => in_array($p, $permissions, true);

        $items = [
            [
                'label' => 'Dashboard',
                'href' => '/admin',
                'icon' => 'layout-dashboard',
                'visible' => $can('analytics.view') || $can('platform.manage'),
            ],
        ];

        if (in_array('cms', $enabled, true) && ($can('cms.homepage.manage') || $can('cms.pages.manage'))) {
            $cmsChildren = [];
            if ($can('cms.homepage.manage') || $can('cms.pages.manage')) {
                $cmsChildren[] = ['label' => 'Homepage', 'href' => '/admin/cms/homepage', 'icon' => 'home'];
            }
            if ($can('cms.pages.manage')) {
                $cmsChildren[] = ['label' => 'Pages', 'href' => '/admin/cms/pages', 'icon' => 'files'];
            }
            $items[] = ['label' => 'CMS', 'icon' => 'file-text', 'children' => $cmsChildren];
        }

        if (in_array('academy', $enabled, true) && $can('academy.courses.manage')) {
            $items[] = [
                'label' => 'Academy',
                'icon' => 'graduation-cap',
                'children' => [
                    ['label' => 'Courses', 'href' => '/admin/academy/courses', 'icon' => 'book-open'],
                    ['label' => 'Enrollments', 'href' => '/admin/academy/enrollments', 'icon' => 'clipboard-list'],
                ],
            ];
        }

        if (in_array('shop', $enabled, true) && $can('shop.products.manage')) {
            $items[] = [
                'label' => 'Sports Shop',
                'icon' => 'shopping-bag',
                'children' => [
                    ['label' => 'Products', 'href' => '/admin/shop/products', 'icon' => 'package'],
                    ['label' => 'Orders', 'href' => '/admin/shop/orders', 'icon' => 'shopping-cart'],
                ],
            ];
        }

        if (in_array('tours', $enabled, true) && ($can('tours.packages.manage') || $can('tours.bookings.manage'))) {
            $tourChildren = [];
            if ($can('tours.packages.manage')) {
                $tourChildren[] = ['label' => 'Packages', 'href' => '/admin/tours/packages', 'icon' => 'map-pin'];
            }
            if ($can('tours.bookings.manage')) {
                $tourChildren[] = ['label' => 'Bookings', 'href' => '/admin/tours/bookings', 'icon' => 'calendar'];
            }
            $items[] = ['label' => 'Tours & Travels', 'icon' => 'plane', 'children' => $tourChildren];
        }

        if ($can('platform.manage') || $can('users.manage')) {
            $items[] = [
                'label' => 'Settings',
                'icon' => 'settings',
                'children' => [
                    ['label' => 'Modules', 'href' => '/admin/settings/modules', 'icon' => 'blocks'],
                    ['label' => 'Users', 'href' => '/admin/settings/users', 'icon' => 'users'],
                ],
            ];
        }

        return array_values(array_filter($items, function ($item) {
            if (isset($item['children'])) {
                return count($item['children']) > 0;
            }

            return $item['visible'] ?? true;
        }));
    }
}
