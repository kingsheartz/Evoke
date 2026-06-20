<?php

namespace App\Http\Controllers\Api\V1\Payments;

use App\Application\Payments\Services\PaymentService;
use App\Events\Shop\PaymentSucceeded;
use App\Http\Controllers\Controller;
use App\Models\Academy\Enrollment;
use App\Models\Shop\Order;
use App\Models\Tours\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
    ) {}

    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payable_type' => 'required|string|in:shop_order,tour_booking,academy_enrollment',
            'payable_id' => 'required|integer',
        ]);

        [$amount, $receipt] = $this->resolvePayable(
            $request->user()->id,
            $validated['payable_type'],
            $validated['payable_id'],
        );

        $razorpay = $this->payments->createRazorpayOrder($amount, $receipt);

        return response()->json([
            'data' => [
                'configured' => $this->payments->isConfigured(),
                'amount' => $amount,
                'receipt' => $receipt,
                'razorpay' => $razorpay,
            ],
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payable_type' => 'required|string|in:shop_order,tour_booking,academy_enrollment',
            'payable_id' => 'required|integer',
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        if (! $this->payments->verifySignature(
            $validated['razorpay_order_id'],
            $validated['razorpay_payment_id'],
            $validated['razorpay_signature'],
        )) {
            abort(422, 'Payment verification failed.');
        }

        $record = $this->markPaid(
            $request->user()->id,
            $validated['payable_type'],
            $validated['payable_id'],
            $validated['razorpay_payment_id'],
        );

        if ($record instanceof Order) {
            PaymentSucceeded::dispatch($record, (float) $record->total);
        }

        return response()->json(['data' => $record, 'message' => 'Payment recorded successfully.']);
    }

    /** @return array{0: float, 1: string} */
    private function resolvePayable(int $userId, string $type, int $id): array
    {
        return match ($type) {
            'shop_order' => (function () use ($userId, $id) {
                $order = Order::where('user_id', $userId)->findOrFail($id);
                abort_if($order->payment_status === 'paid', 422, 'Order is already paid.');

                return [(float) $order->total, $order->order_number];
            })(),
            'tour_booking' => (function () use ($userId, $id) {
                $booking = Booking::where('user_id', $userId)->findOrFail($id);
                abort_if($booking->payment_status === 'paid', 422, 'Booking is already paid.');

                return [(float) $booking->total_amount, $booking->booking_number];
            })(),
            'academy_enrollment' => (function () use ($userId, $id) {
                $enrollment = Enrollment::where('user_id', $userId)->with('batch.course')->findOrFail($id);
                abort_if($enrollment->payment_status === 'paid', 422, 'Enrollment is already paid.');
                $amount = (float) ($enrollment->amount_paid ?: $enrollment->batch?->course?->fees ?? 0);

                return [$amount, 'ENR-'.$enrollment->id];
            })(),
        };
    }

    private function markPaid(int $userId, string $type, int $id, string $paymentReference): Order|Booking|Enrollment
    {
        return match ($type) {
            'shop_order' => tap(Order::where('user_id', $userId)->findOrFail($id), function (Order $order) use ($paymentReference) {
                $order->update([
                    'payment_status' => 'paid',
                    'payment_method' => 'razorpay',
                    'payment_reference' => $paymentReference,
                    'status' => $order->status === 'pending' ? 'processing' : $order->status,
                ]);
            }),
            'tour_booking' => tap(Booking::where('user_id', $userId)->findOrFail($id), function (Booking $booking) use ($paymentReference) {
                $booking->update([
                    'payment_status' => 'paid',
                    'payment_reference' => $paymentReference,
                ]);
            }),
            'academy_enrollment' => tap(Enrollment::where('user_id', $userId)->with('batch.course')->findOrFail($id), function (Enrollment $enrollment) use ($paymentReference) {
                $enrollment->update([
                    'payment_status' => 'paid',
                    'payment_reference' => $paymentReference,
                    'amount_paid' => $enrollment->amount_paid ?: $enrollment->batch?->course?->fees,
                ]);
            }),
        };
    }
}
