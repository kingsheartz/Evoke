<?php

namespace App\Http\Controllers\Api\V1\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = $this->findValidCoupon($validated['code'], (float) $validated['subtotal']);

        if (! $coupon) {
            return response()->json(['message' => 'Invalid or expired coupon.'], 422);
        }

        $discount = $coupon->type === 'percentage'
            ? (float) $validated['subtotal'] * ((float) $coupon->value / 100)
            : min((float) $coupon->value, (float) $validated['subtotal']);

        return response()->json([
            'data' => [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'discount' => round($discount, 2),
            ],
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $coupons = Coupon::query()
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($coupons);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:32|unique:shop_coupons,code',
            'type' => 'required|string|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
        ]);

        $coupon = Coupon::create([
            ...$validated,
            'code' => strtoupper($validated['code']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $coupon], 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:32|unique:shop_coupons,code,'.$coupon->id,
            'type' => 'sometimes|string|in:percentage,fixed',
            'value' => 'sometimes|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper($validated['code']);
        }

        $coupon->update($validated);

        return response()->json(['data' => $coupon->fresh()]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted.']);
    }

    private function findValidCoupon(string $code, float $subtotal): ?Coupon
    {
        $coupon = Coupon::where('code', strtoupper($code))->where('is_active', true)->first();

        if (! $coupon) {
            return null;
        }

        if ($coupon->starts_at && now()->lt($coupon->starts_at)) {
            return null;
        }

        if ($coupon->expires_at && now()->gt($coupon->expires_at)) {
            return null;
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return null;
        }

        if ($coupon->min_order_amount && $subtotal < (float) $coupon->min_order_amount) {
            return null;
        }

        return $coupon;
    }
}
