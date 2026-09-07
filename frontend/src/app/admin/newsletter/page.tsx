"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Eye, Pencil, Search, Send, Trash2, Users } from "lucide-react";
import { PermissionGate } from "@/components/admin/permission-gate";
import { NewsletterCampaignViewModal } from "@/components/newsletter/newsletter-campaign-view-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurableDataTable, TableEmpty, TableLoading, type TableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableExportActions } from "@/components/ui/table-export-actions";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableIconAction, TableRowActions, tableIconDeleteClassName } from "@/components/ui/table-row-actions";
import { Textarea } from "@/components/ui/textarea";
import {
  apiClient,
  type NewsletterCampaign,
  type NewsletterCampaignPayload,
  type NewsletterStats,
  type NewsletterSubscriber,
} from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useConfirm } from "@/lib/process-modal";
import { useAuthStore } from "@/stores/app";

const emptyForm: NewsletterCampaignPayload = {
  subject: "",
  body: "",
};

const subscriberExportColumns = [
  { header: "Email", value: (row: NewsletterSubscriber) => row.email },
  { header: "Status", value: (row: NewsletterSubscriber) => row.status },
  {
    header: "Subscribed",
    value: (row: NewsletterSubscriber) => new Date(row.subscribed_at).toLocaleString(),
  },
  {
    header: "Unsubscribed",
    value: (row: NewsletterSubscriber) =>
      row.unsubscribed_at ? new Date(row.unsubscribed_at).toLocaleString() : "",
  },
];

const campaignExportColumns = [
  { header: "Subject", value: (row: NewsletterCampaign) => row.subject },
  { header: "Status", value: (row: NewsletterCampaign) => row.status },
  { header: "Sent", value: (row: NewsletterCampaign) => row.sent_count },
  { header: "Failed", value: (row: NewsletterCampaign) => row.failed_count },
  {
    header: "Updated",
    value: (row: NewsletterCampaign) => new Date(row.updated_at).toLocaleString(),
  },
];

export default function NewsletterAdminPage() {
  const token = useAuthStore((s) => s.token);
  const { success, error: notifyError } = useNotifications();
  const confirm = useConfirm();

  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscriberLastPage, setSubscriberLastPage] = useState(1);
  const [subscriberTotal, setSubscriberTotal] = useState(0);
  const [subscriberPageSize, setSubscriberPageSize] = useState(20);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberStatus, setSubscriberStatus] = useState("");

  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignLastPage, setCampaignLastPage] = useState(1);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignPageSize, setCampaignPageSize] = useState(20);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<NewsletterCampaign | null>(null);

  const loadStats = useCallback(() => {
    if (!token) return;
    setLoadingStats(true);
    apiClient
      .getNewsletterStats(token)
      .then((response) => setStats(response.data ?? null))
      .catch(() => notifyError("Could not load newsletter stats."))
      .finally(() => setLoadingStats(false));
  }, [token, notifyError]);

  const loadSubscribers = useCallback(() => {
    if (!token) return;
    setLoadingSubscribers(true);
    apiClient
      .getNewsletterSubscribers(token, {
        page: subscriberPage,
        per_page: subscriberPageSize,
        status: subscriberStatus || undefined,
        search: subscriberSearch.trim() || undefined,
      })
      .then((response) => {
        setSubscribers(response.data ?? []);
        setSubscriberLastPage(response.last_page);
        setSubscriberTotal(response.total);
      })
      .catch(() => notifyError("Could not load subscribers."))
      .finally(() => setLoadingSubscribers(false));
  }, [token, subscriberPage, subscriberPageSize, subscriberStatus, subscriberSearch, notifyError]);

  const loadCampaigns = useCallback(() => {
    if (!token) return;
    setLoadingCampaigns(true);
    apiClient
      .getNewsletterCampaigns(token, { page: campaignPage, per_page: campaignPageSize })
      .then((response) => {
        setCampaigns(response.data ?? []);
        setCampaignLastPage(response.last_page);
        setCampaignTotal(response.total);
      })
      .catch(() => notifyError("Could not load campaigns."))
      .finally(() => setLoadingCampaigns(false));
  }, [token, campaignPage, campaignPageSize, notifyError]);

  useEffect(loadStats, [loadStats]);

  useEffect(() => {
    const timer = window.setTimeout(loadSubscribers, subscriberSearch ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [loadSubscribers, subscriberSearch]);

  useEffect(loadCampaigns, [loadCampaigns]);

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
      loadCampaigns();
      loadStats();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Could not save draft.");
    } finally {
      setSaving(false);
    }
  };

  const editCampaign = (campaign: NewsletterCampaign) => {
    if (campaign.status !== "draft" && campaign.status !== "failed") return;
    setViewingCampaign(null);
    setEditingId(campaign.id);
    setForm({ subject: campaign.subject, body: campaign.body });
    document.getElementById("newsletter-draft-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const viewCampaign = (campaign: NewsletterCampaign) => {
    setViewingCampaign(campaign);
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
      loadCampaigns();
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
      loadCampaigns();

      if (response.data.processing) {
        success("Send started. Status will update when delivery finishes.");
        await pollCampaignStatus(campaign.id);
        return;
      }

      success(
        `Sent to ${response.data.sent} subscribers${response.data.failed ? ` (${response.data.failed} failed)` : ""}.`,
      );
      loadCampaigns();
      loadStats();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Send failed.");
      loadCampaigns();
    } finally {
      setSendingId(null);
    }
  };

  const pollCampaignStatus = async (campaignId: number) => {
    if (!token) return;

    for (let attempt = 0; attempt < 45; attempt++) {
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
      try {
        const response = await apiClient.getNewsletterCampaign(token, campaignId);
        const status = response.data.status;
        if (status !== "sending") {
          loadCampaigns();
          loadStats();
          if (status === "sent") {
            success(
              `Sent to ${response.data.sent_count} subscribers${response.data.failed_count ? ` (${response.data.failed_count} failed)` : ""}.`,
            );
          } else if (status === "failed") {
            notifyError("Newsletter send failed. Check SMTP settings and backend logs.");
          }
          return;
        }
      } catch {
        // Keep polling until timeout.
      }
    }

    loadCampaigns();
    notifyError("Send is taking longer than expected. Refresh the page to check status.");
  };

  const sendTest = async (campaign: NewsletterCampaign) => {
    if (!token) return;
    setTestingId(campaign.id);
    try {
      const response = await apiClient.sendNewsletterCampaignTest(token, campaign.id);
      if (response.data.processing) {
        success(`Test email queued for ${response.data.email}. Check your inbox in a minute.`);
      } else {
        success(`Test email sent to ${response.data.email}.`);
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Test send failed.");
    } finally {
      setTestingId(null);
    }
  };

  const subscriberColumns = useMemo<TableColumn<NewsletterSubscriber>[]>(
    () => [
      {
        key: "email",
        header: "Email",
        render: (subscriber) => <span className="font-medium">{subscriber.email}</span>,
      },
      {
        key: "status",
        header: "Status",
        width: 120,
        render: (subscriber) => <StatusBadge status={subscriber.status} />,
      },
      {
        key: "subscribed_at",
        header: "Subscribed",
        width: 160,
        render: (subscriber) => (
          <span className="text-xs text-app-muted">{new Date(subscriber.subscribed_at).toLocaleString()}</span>
        ),
      },
      {
        key: "unsubscribed_at",
        header: "Unsubscribed",
        width: 160,
        render: (subscriber) => (
          <span className="text-xs text-app-muted">
            {subscriber.unsubscribed_at ? new Date(subscriber.unsubscribed_at).toLocaleString() : "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const campaignColumns = useMemo<TableColumn<NewsletterCampaign>[]>(
    () => [
      {
        key: "subject",
        header: "Subject",
        render: (campaign) => (
          <button
            type="button"
            className="text-left text-sm font-medium hover:text-accent-soft"
            onClick={() => viewCampaign(campaign)}
          >
            {campaign.subject}
          </button>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: 120,
        render: (campaign) => <StatusBadge status={campaign.status} />,
      },
      {
        key: "sent",
        header: "Sent",
        width: 100,
        render: (campaign) =>
          campaign.status === "sent"
            ? `${campaign.sent_count}${campaign.failed_count ? ` / ${campaign.failed_count} failed` : ""}`
            : "—",
      },
      {
        key: "updated",
        header: "Updated",
        width: 140,
        render: (campaign) => (
          <span className="text-xs text-app-muted">{new Date(campaign.updated_at).toLocaleString()}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        width: 200,
        hideable: false,
        pinnable: false,
        render: (campaign) => (
          <TableRowActions>
            <TableIconAction icon={Eye} label="View campaign" onClick={() => viewCampaign(campaign)} />
            {(campaign.status === "draft" || campaign.status === "failed") && (
              <TableIconAction icon={Pencil} label="Edit draft" onClick={() => editCampaign(campaign)} />
            )}
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
    [sendingId, testingId],
  );

  return (
    <PermissionGate permission="notifications.manage">
      <div className="app-page">
        <PageHeader
          title="Newsletter"
          description="Draft and send product updates to subscribers via SMTP"
        />

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-8 w-8 text-accent-soft" />
              <div>
                <p className="text-2xl font-semibold text-app-text">
                  {loadingStats ? "—" : (stats?.active_subscribers ?? 0)}
                </p>
                <p className="text-xs text-app-muted">Active subscribers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Mail className="h-8 w-8 text-accent-soft" />
              <div>
                <p className="text-2xl font-semibold text-app-text">
                  {loadingStats ? "—" : (stats?.total_subscribers ?? 0)}
                </p>
                <p className="text-xs text-app-muted">Total sign-ups</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Subscribers ({subscriberTotal})</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
                  <Input
                    className="pl-9"
                    placeholder="Search email…"
                    value={subscriberSearch}
                    onChange={(e) => {
                      setSubscriberSearch(e.target.value);
                      setSubscriberPage(1);
                    }}
                  />
                </div>
                <Select
                  value={subscriberStatus}
                  onChange={(e) => {
                    setSubscriberStatus(e.target.value);
                    setSubscriberPage(1);
                  }}
                  className="w-36"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </Select>
                <TableExportActions
                  filename="newsletter-subscribers"
                  title="Newsletter subscribers"
                  columns={subscriberExportColumns}
                  rows={subscribers}
                  disabled={loadingSubscribers}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent flush>
            {loadingSubscribers && subscribers.length === 0 ? (
              <TableLoading inset />
            ) : subscribers.length === 0 ? (
              <TableEmpty inset message="No subscribers yet." />
            ) : (
              <>
                <ConfigurableDataTable
                  tableId="admin-newsletter-subscribers"
                  inset
                  searchable={false}
                  data={subscribers}
                  keyField="id"
                  columns={subscriberColumns}
                />
                <TablePagination
                  page={subscriberPage}
                  lastPage={subscriberLastPage}
                  total={subscriberTotal}
                  pageSize={subscriberPageSize}
                  onPageChange={setSubscriberPage}
                  onPageSizeChange={(size) => {
                    setSubscriberPageSize(size);
                    setSubscriberPage(1);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6" id="newsletter-draft-form">
          <CardHeader>
            <CardTitle>{editingId ? "Edit draft" : "New draft"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveDraft} className="space-y-4">
              <div className="form-field">
                <Label htmlFor="newsletter-subject">Subject</Label>
                <Input
                  id="newsletter-subject"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="What's new at Evoke"
                  required
                />
              </div>
              <div className="form-field">
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
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    "Update draft"
                  ) : (
                    "Save draft"
                  )}
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Campaigns ({campaignTotal})</CardTitle>
              <TableExportActions
                filename="newsletter-campaigns"
                title="Newsletter campaigns"
                columns={campaignExportColumns}
                rows={campaigns}
                disabled={loadingCampaigns}
              />
            </div>
          </CardHeader>
          <CardContent flush>
            {loadingCampaigns && campaigns.length === 0 ? (
              <TableLoading inset />
            ) : campaigns.length === 0 ? (
              <TableEmpty inset message="No campaigns yet. Save a draft above." />
            ) : (
              <>
                <ConfigurableDataTable
                  tableId="admin-newsletter-campaigns"
                  inset
                  data={campaigns}
                  keyField="id"
                  searchPlaceholder="Search campaigns…"
                  searchText={(campaign) =>
                    [campaign.subject, campaign.status, campaign.body].filter(Boolean).join(" ")
                  }
                  columns={campaignColumns}
                />
                <TablePagination
                  page={campaignPage}
                  lastPage={campaignLastPage}
                  total={campaignTotal}
                  pageSize={campaignPageSize}
                  onPageChange={setCampaignPage}
                  onPageSizeChange={(size) => {
                    setCampaignPageSize(size);
                    setCampaignPage(1);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>

        <NewsletterCampaignViewModal
          campaign={viewingCampaign}
          onClose={() => setViewingCampaign(null)}
          onEdit={editCampaign}
        />
      </div>
    </PermissionGate>
  );
}
