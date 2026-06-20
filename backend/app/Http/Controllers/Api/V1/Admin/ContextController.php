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

        if ($can('tasks.manage')) {
            $items[] = [
                'label' => 'Tasks & Calendar',
                'href' => '/admin/tasks',
                'icon' => 'calendar-days',
                'visible' => true,
            ];
        }

        if (in_array('cms', $enabled, true) && ($can('cms.homepage.manage') || $can('cms.pages.manage'))) {
            $cmsChildren = [];
            if ($can('cms.homepage.manage') || $can('cms.pages.manage')) {
                $cmsChildren[] = ['label' => 'Homepage', 'href' => '/admin/cms/homepage', 'icon' => 'home'];
            }
            if ($can('cms.homepage.manage')) {
                $cmsChildren[] = ['label' => 'Division pages', 'href' => '/admin/cms/divisions', 'icon' => 'layout-grid'];
            }
            if ($can('cms.pages.manage')) {
                $cmsChildren[] = ['label' => 'Pages', 'href' => '/admin/cms/pages', 'icon' => 'files'];
            }
            $items[] = ['label' => 'CMS', 'icon' => 'file-text', 'children' => $cmsChildren];
        }

        if (in_array('academy', $enabled, true) && $can('academy.courses.manage')) {
            $academyChildren = [
                ['label' => 'Courses', 'href' => '/admin/academy/courses', 'icon' => 'book-open'],
                ['label' => 'Enrollments', 'href' => '/admin/academy/enrollments', 'icon' => 'clipboard-list'],
            ];
            if ($can('academy.trainers.manage')) {
                $academyChildren[] = ['label' => 'Trainers', 'href' => '/admin/academy/trainers', 'icon' => 'users'];
            }
            $items[] = [
                'label' => 'EVOKE Academy',
                'icon' => 'graduation-cap',
                'children' => $academyChildren,
            ];
        }

        if (in_array('shop', $enabled, true) && $can('shop.products.manage')) {
            $items[] = [
                'label' => 'EOKE Sports',
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
                $tourChildren[] = ['label' => 'Bookings', 'href' => '/admin/tours/bookings', 'icon' => 'calendar-check'];
            }
            $items[] = ['label' => 'EVOKE Tours', 'icon' => 'plane', 'children' => $tourChildren];
        }

        if ($can('platform.manage') || $can('users.manage') || $can('cms.homepage.manage') || $can('cms.pages.manage')) {
            $settingsChildren = [];
            if ($can('platform.manage') || $can('cms.homepage.manage') || $can('cms.pages.manage')) {
                $settingsChildren[] = ['label' => 'Brand', 'href' => '/admin/settings/brand', 'icon' => 'image'];
            }
            if ($can('platform.manage')) {
                $settingsChildren[] = ['label' => 'Preferences', 'href' => '/admin/settings/preferences', 'icon' => 'sliders'];
                $settingsChildren[] = ['label' => 'Advertisements', 'href' => '/admin/settings/advertisements', 'icon' => 'megaphone'];
                $settingsChildren[] = ['label' => 'Modules', 'href' => '/admin/settings/modules', 'icon' => 'blocks'];
            }
            if ($can('users.manage')) {
                $settingsChildren[] = ['label' => 'Users', 'href' => '/admin/settings/users', 'icon' => 'users'];
            }
            $items[] = [
                'label' => 'Settings',
                'icon' => 'settings',
                'children' => $settingsChildren,
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
