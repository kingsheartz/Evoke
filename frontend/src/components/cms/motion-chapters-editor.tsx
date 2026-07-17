"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MOTION_ART_THEMES,
  createMotionChapter,
  motionChapterIndexLabel,
  type MotionArtTheme,
  type MotionChapter,
} from "@/lib/homepage-meta";
import { MOTION_CHAPTER_ICONS } from "@/lib/motion-icons";
import { cn } from "@/lib/utils";

function tagsToString(tags: string[]): string {
  return tags.join(", ");
}

function parseTagsInput(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function SortableMotionChapter({
  chapter,
  index,
  onChange,
  onDelete,
}: {
  chapter: MotionChapter;
  index: number;
  onChange: (id: string, patch: Partial<MotionChapter>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-app-border bg-app-surface-muted/20 p-4 ring-1 ring-app-border",
        isDragging && "z-10 opacity-90",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-app-border/60 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="cursor-grab shrink-0 text-app-muted hover:text-accent-soft"
            aria-label={`Reorder chapter ${index + 1}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-app-text">
              Chapter {motionChapterIndexLabel(index)}
              {chapter.label?.trim() ? ` · ${chapter.label}` : ""}
            </p>
            <p className="text-xs text-app-muted capitalize">{chapter.art_theme} art</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(chapter.id)}>
          <Trash2 className="h-4 w-4 text-status-error" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-field">
          <Label>Nav label</Label>
          <Input
            value={chapter.label}
            placeholder="Academy"
            onChange={(e) => onChange(chapter.id, { label: e.target.value })}
          />
        </div>
        <div className="form-field">
          <Label>Art style</Label>
          <Select
            value={chapter.art_theme}
            onChange={(e) => onChange(chapter.id, { art_theme: e.target.value as MotionArtTheme })}
          >
            {MOTION_ART_THEMES.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-field md:col-span-2">
          <Label>Eyebrow</Label>
          <Input
            value={chapter.eyebrow}
            placeholder="EVOKE Academy"
            onChange={(e) => onChange(chapter.id, { eyebrow: e.target.value })}
          />
        </div>
        <div className="form-field md:col-span-2">
          <Label>Title</Label>
          <Input
            value={chapter.title}
            placeholder="Train with purpose"
            onChange={(e) => onChange(chapter.id, { title: e.target.value })}
          />
        </div>
        <div className="form-field md:col-span-2">
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={chapter.description}
            onChange={(e) => onChange(chapter.id, { description: e.target.value })}
          />
        </div>
        <div className="form-field">
          <Label>CTA text</Label>
          <Input
            value={chapter.cta}
            onChange={(e) => onChange(chapter.id, { cta: e.target.value })}
          />
        </div>
        <div className="form-field">
          <Label>CTA URL</Label>
          <Input
            value={chapter.href}
            placeholder="/academy"
            onChange={(e) => onChange(chapter.id, { href: e.target.value })}
          />
        </div>
        <div className="form-field md:col-span-2">
          <Label>Tags (comma-separated)</Label>
          <Input
            value={tagsToString(chapter.tags)}
            placeholder="Karate, Yoga, Swimming"
            onChange={(e) => onChange(chapter.id, { tags: parseTagsInput(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <Label>Start icon (arc start)</Label>
          <Select
            value={chapter.start_icon}
            onChange={(e) => onChange(chapter.id, { start_icon: e.target.value })}
          >
            {MOTION_CHAPTER_ICONS.map((icon) => (
              <option key={icon.value} value={icon.value}>
                {icon.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-field">
          <Label>End icon (arc end)</Label>
          <Select
            value={chapter.end_icon}
            onChange={(e) => onChange(chapter.id, { end_icon: e.target.value })}
          >
            {MOTION_CHAPTER_ICONS.map((icon) => (
              <option key={icon.value} value={icon.value}>
                {icon.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

export function MotionChaptersEditor({
  chapters,
  onChange,
}: {
  chapters: MotionChapter[];
  onChange: (chapters: MotionChapter[]) => void;
}) {
  const [newTheme, setNewTheme] = useState<MotionArtTheme>("academy");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateChapter = (id: string, patch: Partial<MotionChapter>) => {
    onChange(chapters.map((chapter) => (chapter.id === id ? { ...chapter, ...patch } : chapter)));
  };

  const deleteChapter = (id: string) => {
    onChange(chapters.filter((chapter) => chapter.id !== id).map((chapter, index) => ({ ...chapter, sort_order: index })));
  };

  const addChapter = () => {
    onChange([...chapters, { ...createMotionChapter(newTheme), sort_order: chapters.length }]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = chapters.findIndex((chapter) => chapter.id === active.id);
    const newIndex = chapters.findIndex((chapter) => chapter.id === over.id);
    onChange(arrayMove(chapters, oldIndex, newIndex).map((chapter, index) => ({ ...chapter, sort_order: index })));
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chapters.map((chapter) => chapter.id)} strategy={verticalListSortingStrategy}>
          <div className={cn("space-y-4", chapters.length === 0 && "hidden")}>
            {chapters.map((chapter, index) => (
              <SortableMotionChapter
                key={chapter.id}
                chapter={chapter}
                index={index}
                onChange={updateChapter}
                onDelete={deleteChapter}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {chapters.length === 0 && (
        <p className="rounded-xl border border-dashed border-app-border px-4 py-6 text-center text-sm text-app-muted">
          No motion chapters yet. Add one to build the scroll journey on the Motion homepage.
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-app-border bg-app-surface/60 p-5 ring-1 ring-app-border sm:flex-row sm:items-end">
        <div className="form-field min-w-0 flex-1">
          <Label>Art style for new chapter</Label>
          <Select value={newTheme} onChange={(e) => setNewTheme(e.target.value as MotionArtTheme)}>
            {MOTION_ART_THEMES.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" className="w-full shrink-0 sm:w-auto" onClick={addChapter}>
          <Plus className="h-4 w-4" />
          Add chapter
        </Button>
      </div>
    </div>
  );
}
