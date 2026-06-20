<?php

namespace App\Application\Payments\Services;

use Razorpay\Api\Api;

class PaymentService
{
    public function isConfigured(): bool
    {
        return filled(config('services.razorpay.key')) && filled(config('services.razorpay.secret'));
    }

    /** @return array{order_id: string, amount: int, currency: string, key: string}|null */
    public function createRazorpayOrder(float $amountInr, string $receipt): ?array
    {
        if (! $this->isConfigured() || $amountInr <= 0) {
            return null;
        }

        $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
        $order = $api->order->create([
            'receipt' => $receipt,
            'amount' => (int) round($amountInr * 100),
            'currency' => 'INR',
        ]);

        return [
            'order_id' => $order['id'],
            'amount' => (int) $order['amount'],
            'currency' => $order['currency'],
            'key' => config('services.razorpay.key'),
        ];
    }

    public function verifySignature(string $orderId, string $paymentId, string $signature): bool
    {
        if (! $this->isConfigured()) {
            return false;
        }

        $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
        $api->utility->verifyPaymentSignature([
            'razorpay_order_id' => $orderId,
            'razorpay_payment_id' => $paymentId,
            'razorpay_signature' => $signature,
        ]);

        return true;
    }
}
