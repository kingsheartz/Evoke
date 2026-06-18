"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminTaskCalendar, monthRange, toDateKey } from "@/components/admin/admin-task-calendar";
import { AdminTaskPanel } from "@/components/admin/admin-task-panel";
import { PermissionGate } from "@/components/admin/permission-gate";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient, type AdminTask, type AdminTaskPayload } from "@/lib/api";
import { useNotifications } from "@/lib/notifications";
import { useAuthStore } from "@/stores/app";

export default function AdminTasksPage() {
  const token = useAuthStore((s) => s.token);
  const { error: notifyError } = useNotifications();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [listTasks, setListTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateKey(new Date()));

  const calendarRange = useMemo(() => {
    const { start, end } = monthRange(month.getFullYear(), month.getMonth());
    return {
      from: toDateKey(start),
      to: toDateKey(end),
    };
  }, [month]);

  const loadCalendarTasks = useCallback(async () => {
    if (!token) return;
    const res = await apiClient.getAdminTasks(token, calendarRange);
    setTasks(res.data);
  }, [token, calendarRange]);

  const loadListTasks = useCallback(async () => {
    if (!token) return;
    const res = await apiClient.getAdminTasks(
      token,
      selectedDate ? { date: selectedDate } : undefined,
    );
    setListTasks(res.data);
  }, [token, selectedDate]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([loadCalendarTasks(), loadListTasks()])
      .catch(() => notifyError("Unable to load tasks."))
      .finally(() => setLoading(false));
  }, [token, loadCalendarTasks, loadListTasks, notifyError]);

  const refresh = async () => {
    await Promise.all([loadCalendarTasks(), loadListTasks()]);
  };

  const handleCreate = async (payload: AdminTaskPayload) => {
    if (!token) return;
    await apiClient.createAdminTask(token, payload);
    await refresh();
  };

  const handleUpdate = async (id: number, payload: Partial<AdminTaskPayload>) => {
    if (!token) return;
    await apiClient.updateAdminTask(token, id, payload);
    await refresh();
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    await apiClient.deleteAdminTask(token, id);
    await refresh();
  };

  const handleToggleComplete = async (task: AdminTask) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    await handleUpdate(task.id, { status: nextStatus });
  };

  return (
    <PermissionGate permission="tasks.manage" fallback={<p className="text-sm text-app-muted">Access denied.</p>}>
      <div className="app-page">
        <PageHeader
          title="Tasks & Calendar"
          badge="Planning"
          description="Track admin to-dos on a calendar — due dates, priorities, and completion status."
        />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <AdminTaskCalendar
            tasks={tasks}
            month={month}
            selectedDate={selectedDate}
            onMonthChange={setMonth}
            onSelectDate={setSelectedDate}
          />
          <div className="min-h-[32rem]">
            <AdminTaskPanel
              tasks={listTasks}
              selectedDate={selectedDate}
              loading={loading}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
