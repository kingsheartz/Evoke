<?php

namespace App\Http\Controllers\Api\V1\Newsletter;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterCampaignJob;
use App\Jobs\SendNewsletterTestJob;
use App\Models\Newsletter\NewsletterCampaign;
use App\Models\Newsletter\NewsletterSubscriber;
use App\Support\MailDelivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterCampaignController extends Controller
{
    public function stats(): JsonResponse
    {
        $active = NewsletterSubscriber::query()->where('status', 'active')->count();
        $total = NewsletterSubscriber::query()->count();

        return response()->json([
            'data' => [
                'active_subscribers' => $active,
                'total_subscribers' => $total,
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $campaigns = NewsletterCampaign::query()
            ->with('creator:id,name,email')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($campaigns);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string|max:50000',
        ]);

        $campaign = NewsletterCampaign::create([
            ...$validated,
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $campaign->load('creator:id,name,email')], 201);
    }

    public function show(NewsletterCampaign $campaign): JsonResponse
    {
        return response()->json(['data' => $campaign->load('creator:id,name,email')]);
    }

    public function update(Request $request, NewsletterCampaign $campaign): JsonResponse
    {
        abort_unless($campaign->isEditable(), 422, 'Only draft campaigns can be edited.');

        $validated = $request->validate([
            'subject' => 'sometimes|string|max:255',
            'body' => 'sometimes|string|max:50000',
        ]);

        $campaign->update($validated);

        return response()->json(['data' => $campaign->fresh()->load('creator:id,name,email')]);
    }

    public function destroy(NewsletterCampaign $campaign): JsonResponse
    {
        abort_unless($campaign->status === 'draft', 422, 'Only draft campaigns can be deleted.');

        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted.']);
    }

    public function send(Request $request, NewsletterCampaign $campaign): JsonResponse
    {
        if ($campaign->status === 'sending' && $campaign->updated_at?->lt(now()->subMinutes(10))) {
            $campaign->update(['status' => 'failed']);
            $campaign->refresh();
        }

        abort_if($campaign->status === 'sending', 422, 'This campaign is already being sent.');
        abort_if($campaign->status === 'sent', 422, 'This campaign has already been sent.');

        if ($campaign->status !== 'draft' && $campaign->status !== 'failed') {
            abort(422, 'This campaign cannot be sent.');
        }

        abort_unless(
            MailDelivery::isNewsletterDeliverable(),
            422,
            'Newsletter mail is not configured. Set SMTP credentials in the backend environment.',
        );

        try {
            MailDelivery::assertNewsletterTransportReady();
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $campaign->update(['status' => 'sending']);

        SendNewsletterCampaignJob::dispatch($campaign)->afterResponse();

        return response()->json([
            'message' => 'Newsletter send started.',
            'data' => [
                'campaign' => $campaign->fresh()->load('creator:id,name,email'),
                'sent' => 0,
                'failed' => 0,
                'processing' => true,
            ],
        ], 202);
    }

    public function sendTest(Request $request, NewsletterCampaign $campaign): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|email:rfc|max:255',
        ]);

        $email = $validated['email'] ?? $request->user()->email;
        abort_if($email === null || $email === '', 422, 'No email address available for test send.');

        abort_unless(
            MailDelivery::isNewsletterDeliverable(),
            422,
            'Newsletter mail is not configured. Set MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD on the API service.',
        );

        try {
            MailDelivery::assertNewsletterTransportReady();
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        SendNewsletterTestJob::dispatch($campaign, $email)->afterResponse();

        return response()->json([
            'message' => 'Test email queued.',
            'data' => ['email' => $email, 'processing' => true],
        ], 202);
    }
}
