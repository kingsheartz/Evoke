"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormattedTextField } from "@/components/ui/formatted-text-field";
import { FormattedBody } from "@/components/ui/formatted-text";
import { apiClient, type ItineraryDay } from "@/lib/api";
import { revalidateTourPublicCache } from "@/lib/revalidate-cms";
import type { TextFormat } from "@/lib/text-format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/app";

interface DayDraft {
  day_number: number;
  title: string;
  description: string;
  description_format?: TextFormat;
}

const emptyDraft = (dayNumber: number): DayDraft => ({
  day_number: dayNumber,
  title: "",
  description: "",
});

function SortableItineraryDay({
  day,
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  draft,
  onDraftChange,
}: {
  day: ItineraryDay;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  draft: DayDraft;
  onDraftChange: (patch: Partial<DayDraft>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: day.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-app-border bg-app-surface/80 ring-1 ring-app-border",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      <div className="flex items-start gap-2 p-4">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab text-app-muted hover:text-accent-soft"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          {editing ? (
            <>
              <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                <div className="space-y-2">
                  <Label>Day #</Label>
                  <Input
                    type="number"
                    min={1}
                    value={draft.day_number}
                    onChange={(e) => onDraftChange({ day_number: Number(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => onDraftChange({ title: e.target.value })}
                    placeholder="e.g. Scenic Drive & Tea Plantations"
                  />
                </div>
              </div>
              <FormattedTextField
                label="Description"
                value={draft.description}
                format={draft.description_format}
                preset="body"
                multiline
                rows={5}
                onChange={(description, description_format) => onDraftChange({ description, description_format })}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={onSave} disabled={saving || !draft.title.trim()}>
                  {saving ? "Saving…" : "Save day"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="font-medium text-app-text">
                Day {day.day_number}: {day.title}
              </p>
              {day.description?.trim() ? (
                <FormattedBody
                  text={day.description}
                  format={day.description_format ?? undefined}
                  className="text-sm leading-relaxed text-app-muted"
                />
              ) : (
                <p className="text-sm italic text-app-muted/80">No description yet.</p>
              )}
            </>
          )}
        </div>

        {!editing && (
          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="ghost" size="sm" title="Edit day" onClick={onEdit}>
              <Pencil className="h-4 w-4 text-app-muted" />
            </Button>
            <Button type="button" variant="ghost" size="sm" title="Delete day" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-status-error" />
            </Button>
          </div>
        )}

        {editing && (
          <Button type="button" variant="ghost" size="sm" title="Cancel editing" onClick={onCancel}>
            <X className="h-4 w-4 text-app-muted" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ItineraryDaysEditor({
  packageId,
  packageSlug,
  days: initialDays,
  onChange,
}: {
  packageId: number;
  packageSlug?: string | null;
  days: ItineraryDay[];
  onChange?: (days: ItineraryDay[]) => void;
}) {
  const token = useAuthStore((s) => s.token);
  const [days, setDays] = useState(initialDays);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DayDraft>(emptyDraft(1));
  const [newDay, setNewDay] = useState<DayDraft>(emptyDraft(1));
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDays(initialDays);
    setNewDay(emptyDraft(initialDays.length + 1));
  }, [initialDays]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function syncDays(next: ItineraryDay[]) {
    setDays(next);
    onChange?.(next);
  }

  async function refreshPublic() {
    await revalidateTourPublicCache(packageSlug ?? undefined);
  }

  function startEdit(day: ItineraryDay) {
    setEditingId(day.id);
    setDraft({
      day_number: day.day_number,
      title: day.title,
      description: day.description ?? "",
      description_format: day.description_format ?? undefined,
    });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft(1));
  }

  async function saveDay(dayId: number) {
    if (!token || !draft.title.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await apiClient.updateItineraryDay(token, packageId, dayId, {
        day_number: draft.day_number,
        title: draft.title.trim(),
        description: draft.description,
        description_format: draft.description_format,
      });
      const next = days.map((day) => (day.id === dayId ? response.data : day)).sort((a, b) => a.day_number - b.day_number);
      syncDays(next);
      setEditingId(null);
      await refreshPublic();
      setMessage("Itinerary day updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save itinerary day.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDay(dayId: number) {
    if (!token) return;
    setSaving(true);
    setMessage(null);
    try {
      await apiClient.deleteItineraryDay(token, packageId, dayId);
      const next = days.filter((day) => day.id !== dayId);
      syncDays(next);
      if (editingId === dayId) cancelEdit();
      setNewDay(emptyDraft(next.length + 1));
      await refreshPublic();
      setMessage("Itinerary day deleted.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not delete itinerary day.");
    } finally {
      setSaving(false);
    }
  }

  async function addDay() {
    if (!token || !newDay.title.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await apiClient.createItineraryDay(token, packageId, {
        day_number: newDay.day_number,
        title: newDay.title.trim(),
        description: newDay.description,
        description_format: newDay.description_format,
        activities: [],
      });
      const next = [...days, response.data].sort((a, b) => a.day_number - b.day_number);
      syncDays(next);
      setNewDay(emptyDraft(next.length + 1));
      await refreshPublic();
      setMessage("Itinerary day added.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not add itinerary day.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !token) return;

    const oldIndex = days.findIndex((day) => day.id === active.id);
    const newIndex = days.findIndex((day) => day.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(days, oldIndex, newIndex).map((day, index) => ({
      ...day,
      day_number: index + 1,
    }));

    syncDays(reordered);
    setSaving(true);
    setMessage(null);

    try {
      const response = await apiClient.reorderItineraryDays(
        token,
        packageId,
        reordered.map((day) => ({ id: day.id, day_number: day.day_number })),
      );
      syncDays(response.data);
      setNewDay(emptyDraft(response.data.length + 1));
      await refreshPublic();
      setMessage("Itinerary order updated.");
    } catch (e) {
      syncDays(days);
      setMessage(e instanceof Error ? e.message : "Could not reorder itinerary days.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-app-muted">
        Drag days to reorder. Click the pencil to edit title and description with formatting. Changes appear on the
        public tour detail page.
      </p>

      {days.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={days.map((day) => day.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {days.map((day) => (
                <SortableItineraryDay
                  key={day.id}
                  day={day}
                  editing={editingId === day.id}
                  saving={saving}
                  draft={draft}
                  onDraftChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
                  onEdit={() => startEdit(day)}
                  onCancel={cancelEdit}
                  onSave={() => saveDay(day.id)}
                  onDelete={() => deleteDay(day.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border border-dashed border-app-border px-4 py-8 text-center text-sm text-app-muted">
          No itinerary days yet. Add the first day below.
        </div>
      )}

      <div className="grid gap-3 rounded-lg border border-dashed border-app-border bg-app-surface/60 p-4 ring-1 ring-app-border">
        <p className="text-sm font-medium text-app-text">Add itinerary day</p>
        <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label>Day #</Label>
            <Input
              type="number"
              min={1}
              value={newDay.day_number}
              onChange={(e) => setNewDay({ ...newDay, day_number: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={newDay.title}
              onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
              placeholder="e.g. National Park & Lake Circuit"
            />
          </div>
        </div>
        <FormattedTextField
          label="Description"
          value={newDay.description}
          format={newDay.description_format}
          preset="body"
          multiline
          rows={4}
          onChange={(description, description_format) => setNewDay({ ...newDay, description, description_format })}
        />
        <div>
          <Button type="button" onClick={addDay} disabled={saving || !newDay.title.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add day
          </Button>
        </div>
      </div>

      {message && (
        <p
          className={cn(
            "text-sm",
            message.includes("Could not") ? "text-status-error" : "text-status-success",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
