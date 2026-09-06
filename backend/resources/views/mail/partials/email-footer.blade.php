                        <p style="margin:0 0 6px;font-size:12px;color:#71717a;line-height:1.5;">
                            This is an automated message from {{ $brandName }}. Please do not reply to this email.
                        </p>
                        @if(!empty($socialLinks))
                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:12px 0 0;">
                            <tr>
                                @foreach($socialLinks as $link)
                                <td style="padding-right:8px;">
                                    <a href="{{ $link['url'] }}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                                        <img src="{{ $link['iconUrl'] }}" alt="{{ $link['label'] }}" width="28" height="28" style="display:block;border:0;border-radius:6px;">
                                    </a>
                                </td>
                                @endforeach
                            </tr>
                        </table>
                        @endif
                        @if(!empty($siteUrl))
                            <p style="margin:12px 0 0;font-size:12px;color:#71717a;">
                                <a href="{{ $siteUrl }}" style="color:{{ $accentColor ?? '#6366f1' }};text-decoration:none;">Visit our website</a>
                            </p>
                        @endif
                        @if(!empty($unsubscribeUrl))
                            <p style="margin:8px 0 0;font-size:11px;color:#a1a1aa;">
                                <a href="{{ $unsubscribeUrl }}" style="color:#a1a1aa;text-decoration:underline;">Unsubscribe</a>
                            </p>
                        @endif
