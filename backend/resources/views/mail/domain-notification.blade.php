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
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
                <tr>
                    <td style="padding:28px 32px 20px;text-align:center;background:linear-gradient(180deg,#18181b 0%,#27272a 100%);">
                        @if($logoUrl)
                            <img src="{{ $logoUrl }}" alt="{{ $brandName }}" width="56" height="56" style="display:block;margin:0 auto 12px;border-radius:12px;">
                        @endif
                        <p style="margin:0;font-size:18px;font-weight:600;color:#fafafa;letter-spacing:0.02em;">{{ $brandName }}</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:32px;">
                        <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;line-height:1.4;">{{ $mailSubject }}</h1>
                        <div style="font-size:15px;line-height:1.7;color:#3f3f46;white-space:pre-line;">{!! nl2br(e($body)) !!}</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 32px 28px;border-top:1px solid #f4f4f5;background-color:#fafafa;">
                        <p style="margin:0 0 6px;font-size:12px;color:#71717a;line-height:1.5;">
                            This is an automated message from {{ $brandName }}. Please do not reply to this email.
                        </p>
                        @if($siteUrl)
                            <p style="margin:0;font-size:12px;color:#71717a;">
                                <a href="{{ $siteUrl }}" style="color:#6366f1;text-decoration:none;">Visit our website</a>
                            </p>
                        @endif
                    </td>
                </tr>
            </table>
            <p style="margin:16px 0 0;font-size:11px;color:#a1a1aa;text-align:center;">&copy; {{ date('Y') }} {{ $brandName }}. All rights reserved.</p>
        </td>
    </tr>
</table>
</body>
</html>
