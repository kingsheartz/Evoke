"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Send, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading, type TableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableIconAction, TableRowActions, tableIconDeleteClassName } from "@/components/ui/table-row-actions";
import { Textarea } from "@/components/ui/textarea";
import {
  apiClient,
  type NewsletterCampaign,
  type NewsletterCampaignPayload,
  type NewsletterStats,
} from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useConfirm } from "@/lib/process-modal";
import { useAuthStore } from "@/stores/app";

const emptyForm: NewsletterCampaignPayload = {
  subject: "",
  body: "",
};

export default function NewsletterAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const confirm = useConfirm();
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    Promise.all([apiClient.getNewsletterStats(token), apiClient.getNewsletterCampaigns(token)])
      .then(([statsResponse, campaignsResponse]) => {
        setStats(statsResponse.data ?? null);
        setCampaigns(campaignsResponse.data ?? []);
      })
      .catch(() => notifyError("Could not load newsletter data."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.subject.trim() || !form.body.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await apiClient.updateNewsletterCampaign(token, editingId, form);
        success("Draft updated.");
      } else {
        await apiClient.createNewsletterCampaign(token, form);
        success("Draft saved.");
      }
      resetForm();
      load();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not save draft.");
    } finally {
      setSaving(false);
    }
  };

  const editCampaign = (campaign: NewsletterCampaign) => {
    if (campaign.status !== "draft" && campaign.status !== "failed") return;
    setEditingId(campaign.id);
    setForm({ subject: campaign.subject, body: campaign.body });
  };

  const remove = async (campaign: NewsletterCampaign) => {
    if (!token || campaign.status !== "draft") return;
    const confirmed = await confirm({
      title: "Delete draft?",
      description: `This will permanently delete "${campaign.subject}".`,
      confirmLabel: "Delete draft",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await apiClient.deleteNewsletterCampaign(token, campaign.id);
      success("Draft deleted.");
      if (editingId === campaign.id) resetForm();
      load();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const sendCampaign = async (campaign: NewsletterCampaign) => {
    if (!token) return;
    const confirmed = await confirm({
      title: "Send newsletter?",
      description: `Send "${campaign.subject}" to ${stats?.active_subscribers ?? 0} active subscribers via SMTP?`,
      confirmLabel: "Send now",
    });
    if (!confirmed) return;

    setSendingId(campaign.id);
    try {
      const response = await apiClient.sendNewsletterCampaign(token, campaign.id);
      success(`Sent to ${response.data.sent} subscribers${response.data.failed ? ` (${response.data.failed} failed)` : ""}.`);
      load();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setSendingId(null);
    }
  };

  const sendTest = async (campaign: NewsletterCampaign) => {
    if (!token) return;
    setTestingId(campaign.id);
    try {
      const response = await apiClient.sendNewsletterCampaignTest(token, campaign.id);
      success(`Test email sent to ${response.data.email}.`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Test send failed.");
    } finally {
      setTestingId(null);
    }
  };

  const columns = useMemo<TableColumn<NewsletterCampaign>[]>(
    () => [
      {
        key: "subject",
        header: "Subject",
        render: (campaign: NewsletterCampaign) => (
          <button
            type="button"
            className="text-left text-sm font-medium hover:text-accent-soft"
            onClick={() => editCampaign(campaign)}
          >
            {campaign.subject}
          </button>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: 120,
        render: (campaign: NewsletterCampaign) => <StatusBadge status={campaign.status} />,
      },
      {
        key: "sent",
        header: "Sent",
        width: 100,
        render: (campaign: NewsletterCampaign) =>
          campaign.status === "sent" ? `${campaign.sent_count}${campaign.failed_count ? ` / ${campaign.failed_count} failed` : ""}` : "—",
      },
      {
        key: "updated",
        header: "Updated",
        width: 140,
        render: (campaign: NewsletterCampaign) => (
          <span className="text-xs text-app-muted">{new Date(campaign.updated_at).toLocaleString()}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        width: 140,
        hideable: false,
        pinnable: false,
        render: (campaign: NewsletterCampaign) => (
          <TableRowActions>
            <TableIconAction
              icon={Mail}
              label="Send test email"
              onClick={() => sendTest(campaign)}
              disabled={testingId === campaign.id}
            />
            {(campaign.status === "draft" || campaign.status === "failed") && (
              <>
                <TableIconAction
                  icon={Send}
                  label="Send campaign"
                  onClick={() => sendCampaign(campaign)}
                  disabled={sendingId === campaign.id}
                />
                <TableIconAction
                  icon={Trash2}
                  label="Delete draft"
                  className={tableIconDeleteClassName}
                  onClick={() => remove(campaign)}
                />
              </>
            )}
          </TableRowActions>
        ),
      },
    ],
    [sendingId, stats?.active_subscribers, testingId],
  );

  return (
    <PermissionGate permission="notifications.manage">
      <div className="app-page">
        <PageHeader
          title="Newsletter"
          description="Draft and send product updates to subscribers via SMTP"
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Active subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats?.active_subscribers ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total sign-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stats?.total_subscribers ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit draft" : "New draft"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveDraft} className="space-y-4">
              <div>
                <Label htmlFor="newsletter-subject">Subject</Label>
                <Input
                  id="newsletter-subject"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="What's new at Evoke"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newsletter-body">Message</Label>
                <Textarea
                  id="newsletter-body"
                  value={form.body}
                  onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                  placeholder="Share updates, launches, or announcements…"
                  rows={8}
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update draft" : "Save draft"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent flush>
            {loading ? (
              <TableLoading inset />
            ) : campaigns.length === 0 ? (
              <TableEmpty inset message="No campaigns yet. Save a draft above." />
            ) : (
              <ConfigurableDataTable
                tableId="admin-newsletter-campaigns"
                inset
                data={campaigns}
                keyField="id"
                searchPlaceholder="Search campaigns…"
                searchText={(campaign) =>
                  [campaign.subject, campaign.status, campaign.body].filter(Boolean).join(" ")
                }
                columns={columns}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
