"use client";

import { useEffect } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { NewsletterCampaign } from "@/lib/api";

export function NewsletterCampaignViewModal({
  campaign,
  onClose,
  onEdit,
}: {
  campaign: NewsletterCampaign | null;
  onClose: () => void;
  onEdit?: (campaign: NewsletterCampaign) => void;
}) {
  useEffect(() => {
    if (!campaign) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [campaign, onClose]);

  if (!campaign) return null;

  const editable = campaign.status === "draft" || campaign.status === "failed";

  return (
    <div
      className="fixed inset-0 z-[2147483640] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Campaign: ${campaign.subject}`}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col rounded-xl border border-app-border bg-app-surface shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-app-border px-5 py-4">
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg font-semibold text-app-text">{campaign.subject}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-app-muted">
              <StatusBadge status={campaign.status} />
              {campaign.status === "sent" && (
                <span>
                  Sent {campaign.sent_count}
                  {campaign.failed_count ? ` · ${campaign.failed_count} failed` : ""}
                </span>
              )}
              {campaign.sent_at ? <span>Sent {new Date(campaign.sent_at).toLocaleString()}</span> : null}
              <span>Updated {new Date(campaign.updated_at).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {editable && onEdit ? (
              <Button type="button" variant="outline" size="sm" onClick={() => onEdit(campaign)}>
                <Pencil className="h-4 w-4" />
                Edit draft
              </Button>
            ) : null}
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-muted">Message</p>
          <div className="whitespace-pre-wrap rounded-lg border border-app-border bg-white/[0.02] p-4 text-sm leading-relaxed text-app-text">
            {campaign.body}
          </div>
          {campaign.status === "sending" && (
            <p className="mt-4 text-sm text-status-warning">
              This campaign is still marked as sending. If it appears stuck, wait a few minutes and use Send again, or
              edit after it moves to failed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
