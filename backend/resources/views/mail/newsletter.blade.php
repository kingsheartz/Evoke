<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $mailSubject }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;box-shadow:0 4px 24px rgba(24,24,27,0.06);">
                <tr>
                    <td style="height:4px;background:linear-gradient(90deg,{{ $accentColor ?? '#6366f1' }} 0%,#8b5cf6 100%);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                    <td style="padding:28px 32px 24px;text-align:center;background:linear-gradient(180deg,#18181b 0%,#27272a 100%);">
                        @if(!empty($logoWideUrl))
                            <img src="{{ $logoWideUrl }}" alt="{{ $brandName }}" width="180" style="display:block;margin:0 auto 12px;max-width:180px;height:auto;border:0;">
                        @elseif(!empty($logoUrl))
                            <img src="{{ $logoUrl }}" alt="{{ $brandName }}" width="64" height="64" style="display:block;margin:0 auto 12px;border-radius:14px;border:0;">
                        @endif
                        <p style="margin:0;font-size:18px;font-weight:600;color:#fafafa;letter-spacing:0.02em;">{{ $brandName }}</p>
                        @if(!empty($tagline))
                            <p style="margin:8px 0 0;font-size:13px;color:#a1a1aa;line-height:1.4;">{{ $tagline }}</p>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td style="padding:32px;">
                        @if(!empty($isTest))
                            <p style="margin:0 0 16px;padding:10px 12px;border-radius:8px;background:#fef3c7;color:#92400e;font-size:13px;line-height:1.5;">
                                This is a test send. Only you should receive this email.
                            </p>
                        @endif
                        <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;line-height:1.4;">{{ $mailSubject }}</h1>
                        <div style="font-size:15px;line-height:1.7;color:#3f3f46;white-space:pre-line;">{!! nl2br(e($body)) !!}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 32px 28px;border-top:1px solid #f4f4f5;background-color:#fafafa;">
                        @include('mail.partials.email-footer')
                    </td>
                </tr>
            </table>
            <p style="margin:16px 0 0;font-size:11px;color:#a1a1aa;text-align:center;">&copy; {{ date('Y') }} {{ $brandName }}. All rights reserved.</p>
        </td>
    </tr>
</table>
</body>
</html>
