<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Academy\Course;
use App\Models\Academy\Enrollment;
use App\Models\Shop\Order;
use App\Models\Tours\Booking;
use App\Models\Tours\Enquiry;
use App\Models\User;
use App\Support\DashboardCelebrations;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $revenue = (float) Order::where('payment_status', 'paid')->sum('total')
            + (float) Enrollment::where('payment_status', 'paid')->sum('amount_paid')
            + (float) Booking::where('payment_status', 'paid')->sum('total_amount');

        $celebrations = DashboardCelebrations::today();

        return response()->json([
            'data' => [
                'stats' => [
                    'users' => User::count(),
                    'enrollments' => Enrollment::count(),
                    'orders' => Order::count(),
                    'bookings' => Booking::count(),
                    'enquiries' => Enquiry::where('status', 'new')->count(),
                    'revenue' => $revenue,
                ],
                'recent' => [
                    'orders' => Order::with('user')->latest()->limit(5)->get(['id', 'order_number', 'user_id', 'total', 'status', 'created_at']),
                    'enrollments' => Enrollment::with(['user', 'batch.course'])->latest()->limit(5)->get(),
                    'bookings' => Booking::with(['user', 'package'])->latest()->limit(5)->get(['id', 'booking_number', 'user_id', 'package_id', 'status', 'total_amount', 'created_at']),
                ],
                'modules' => DB::table('business_modules')->orderBy('sort_order')->get(['slug', 'name', 'is_enabled']),
                'celebrations' => $celebrations,
            ],
        ]);
    }
}
