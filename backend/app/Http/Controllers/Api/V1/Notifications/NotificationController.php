<?php

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Mail\DomainNotificationMail;
use App\Support\MailDelivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate($request->integer('per_page', 20));

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function sendTestEmail(Request $request): JsonResponse
    {
        if (! MailDelivery::isDeliverable()) {
            return response()->json([
                'message' => 'Mail is not configured for delivery. Set RESEND_API_KEY (or SMTP) on Render.',
            ], 503);
        }

        $user = $request->user();

        try {
            Mail::mailer(MailDelivery::defaultMailer())
                ->to($user->email)
                ->send(new DomainNotificationMail(
                    'Evoke test email',
                    "This is a test message sent to {$user->email}.\n\nIf you received this, transactional email is working.",
                ));
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Test email failed: '.$e->getMessage(),
            ], 502);
        }

        return response()->json(['message' => 'Test email sent.', 'data' => ['to' => $user->email]]);
    }
}
