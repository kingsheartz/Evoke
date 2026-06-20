<?php

namespace App\Http\Controllers\Api\V1\Shop;

use App\Application\Shop\Services\OrderService;
use App\Events\Shop\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Models\Shop\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id || $request->user()->can('shop.orders.manage'), 403);

        return response()->json(['data' => $order->load('items')]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'billing_address' => 'nullable|array',
            'coupon_code' => 'nullable|string',
        ]);

        $order = $this->orderService->createFromCart(
            $request->user(),
            $validated['shipping_address'],
            $validated['billing_address'] ?? null,
            $validated['coupon_code'] ?? null,
        );

        OrderPlaced::dispatch($order);

        return response()->json(['data' => $order->load('items')], 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['user', 'items'])
            ->when($request->status, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($orders);
    }

    public function adminUpdate(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|string|in:unpaid,paid,refunded',
            'payment_reference' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
        ]);

        $order->update($validated);

        return response()->json(['data' => $order->fresh(['user', 'items'])]);
    }
}
