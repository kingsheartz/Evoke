"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";
import { apiClient, ApiError, type AppNotification } from "@/lib/api";
import { formatInAppNotification } from "@/lib/notification-messages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableEmpty, TableLoading } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function NotificationInbox({ token }: { token: string }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getNotifications(token);
      setNotifications(response.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  const handleMarkRead = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await apiClient.markNotificationRead(token, id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not mark notification as read.");
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    setMarkingAll(true);
    setError(null);
    try {
      await apiClient.markAllNotificationsRead(token);
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          read_at: item.read_at ?? new Date().toISOString(),
        })),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) {
    return <TableLoading inset />;
  }

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg">Notifications</CardTitle>
        {unreadCount > 0 ? (
          <Button type="button" variant="outline" size="sm" disabled={markingAll} onClick={handleMarkAllRead}>
            <CheckCheck className="mr-1.5 size-4" aria-hidden />
            Mark all read
          </Button>
        ) : null}
      </CardHeader>
      <CardContent flush>
        {error ? <p className="px-6 pb-4 text-sm text-status-error">{error}</p> : null}
        {notifications.length === 0 ? (
          <TableEmpty
            inset
            message="No notifications yet. Updates about orders, enrollments, bookings, and certificates will appear here."
          />
        ) : (
          <ul className="divide-y divide-app-border">
            {notifications.map((item) => {
              const { title, body } = formatInAppNotification(item.data);
              const unread = !item.read_at;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={busyId === item.id || !unread}
                    onClick={() => unread && void handleMarkRead(item.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-6 py-4 text-left transition-colors",
                      unread ? "hover:bg-app-surface-muted/60" : "opacity-80",
                      busyId === item.id && "opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-2 size-2 shrink-0 rounded-full",
                        unread ? "bg-accent" : "bg-transparent",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-app-text">{title}</span>
                        <span className="text-xs text-app-muted">{formatTimestamp(item.created_at)}</span>
                      </span>
                      <span className="mt-1 block text-sm text-app-muted">{body}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
