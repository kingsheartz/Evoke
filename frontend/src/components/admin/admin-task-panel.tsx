"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { FormError } from "@/components/admin/admin-form-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AdminTask, AdminTaskPayload, AdminTaskPriority, AdminTaskStatus } from "@/lib/api";
import { useConfirm } from "@/lib/process-modal";
import { cn } from "@/lib/utils";

const emptyForm: AdminTaskPayload = {
  title: "",
  description: "",
  due_at: "",
  status: "pending",
  priority: "medium",
};

interface AdminTaskPanelProps {
  tasks: AdminTask[];
  selectedDate: string | null;
  loading: boolean;
  onCreate: (payload: AdminTaskPayload) => Promise<void>;
  onUpdate: (id: number, payload: Partial<AdminTaskPayload>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleComplete: (task: AdminTask) => Promise<void>;
}

export function AdminTaskPanel({
  tasks,
  selectedDate,
  loading,
  onCreate,
  onUpdate,
  onDelete,
  onToggleComplete,
}: AdminTaskPanelProps) {
  const confirm = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AdminTaskPayload>({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const visibleTasks = tasks.filter((task) => showCompleted || task.status !== "completed");

  const resetForm = () => {
    setForm({
      ...emptyForm,
      due_at: selectedDate ? `${selectedDate}T09:00` : "",
    });
    setEditingId(null);
    setError(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm({
      ...emptyForm,
      due_at: selectedDate ? `${selectedDate}T09:00` : "",
    });
    setEditingId(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (task: AdminTask) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      due_at: task.due_at ? task.due_at.slice(0, 16) : "",
      status: task.status,
      priority: task.priority,
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: AdminTaskPayload = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      };

      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: "Are you sure?",
      description: "This task will be permanently deleted. This action cannot be undone.",
      confirmLabel: "Delete task",
      variant: "danger",
    });
    if (!confirmed) return;
    setSaving(true);
    try {
      await onDelete(id);
      if (editingId === id) resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-app-border bg-app-surface/80 ring-1 ring-app-border">
      <div className="flex items-center justify-between gap-3 border-b border-app-border px-4 py-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-app-text">To-do list</h2>
          <p className="text-xs text-app-muted">
            {selectedDate
              ? `Showing tasks for ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString()}`
              : "All tasks — click a calendar day to filter"}
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-app-border px-4 py-3">
        <Label htmlFor="show-completed" className="cursor-pointer text-sm text-app-muted">
          Show completed
        </Label>
        <Switch
          id="show-completed"
          checked={showCompleted}
          onCheckedChange={setShowCompleted}
          aria-label="Show completed tasks"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 border-b border-app-border bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-app-text">{editingId ? "Edit task" : "New task"}</p>
            <Button type="button" variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Follow up with customer"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Notes</Label>
            <Textarea
              id="task-desc"
              rows={2}
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional details"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="datetime-local"
                value={form.due_at ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                id="task-priority"
                value={form.priority ?? "medium"}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as AdminTaskPriority }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
          </div>
          {editingId && (
            <div className="space-y-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select
                id="task-status"
                value={form.status ?? "pending"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdminTaskStatus }))}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          )}
          <FormError message={error} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {editingId ? "Save changes" : "Create task"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={saving}
                onClick={() => handleDelete(editingId)}
              >
                Delete
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className="p-4 text-center text-sm text-app-muted">Loading tasks…</p>
        ) : visibleTasks.length === 0 ? (
          <p className="p-6 text-center text-sm text-app-muted">
            No tasks yet. Add one or pick a date on the calendar.
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleTasks.map((task) => (
              <li
                key={task.id}
                className={cn(
                  "group rounded-xl border border-app-border bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]",
                  task.status === "completed" && "opacity-70",
                )}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    aria-label={task.status === "completed" ? "Mark incomplete" : "Mark complete"}
                    onClick={() => onToggleComplete(task)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      task.status === "completed"
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                        : "border-app-border text-transparent hover:border-accent hover:text-accent",
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "font-medium text-app-text",
                          task.status === "completed" && "line-through",
                        )}
                      >
                        {task.title}
                      </p>
                      <StatusBadge status={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && (
                      <p className="mt-1 text-xs text-app-muted line-clamp-2">{task.description}</p>
                    )}
                    {task.due_at && (
                      <p className="mt-1 text-xs text-app-muted">
                        Due {new Date(task.due_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(task)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-status-error" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
