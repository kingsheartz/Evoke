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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient, SECTION_TYPES, type PageSection } from "@/lib/api";
import { useAuthStore } from "@/stores/app";

function SortableSection({
  section,
  onUpdate,
  onDelete,
}: {
  section: PageSection;
  onUpdate: (id: number, content: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const content = section.content as { heading?: string; body?: string };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" className="cursor-grab text-zinc-400" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5" />
          </button>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize">{section.component_type}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onDelete(section.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Heading"
          defaultValue={content.heading ?? ""}
          onBlur={(e) => onUpdate(section.id, { ...content, heading: e.target.value })}
        />
        <Textarea
          placeholder="Body content"
          defaultValue={content.body ?? ""}
          onBlur={(e) => onUpdate(section.id, { ...content, body: e.target.value })}
        />
      </div>
    </div>
  );
}

export function PageSectionBuilder({
  pageId,
  sections: initial,
  onChange,
}: {
  pageId: number;
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
}) {
  const token = useAuthStore((s) => s.token);
  const [sections, setSections] = useState(initial);
  const [newType, setNewType] = useState("text");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addSection = async () => {
    if (!token) return;
    const { data } = await apiClient.createPageSection(token, pageId, {
      component_type: newType,
      content: { heading: "New Section", body: "" },
    });
    const next = [...sections, data];
    setSections(next);
    onChange(next);
  };

  const updateSection = async (id: number, content: Record<string, unknown>) => {
    if (!token) return;
    await apiClient.updatePageSection(token, pageId, id, { content });
    const next = sections.map((s) => (s.id === id ? { ...s, content } : s));
    setSections(next);
    onChange(next);
  };

  const deleteSection = async (id: number) => {
    if (!token) return;
    await apiClient.deletePageSection(token, pageId, id);
    const next = sections.filter((s) => s.id !== id);
    setSections(next);
    onChange(next);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !token) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, sort_order: i }));
    setSections(reordered);
    onChange(reordered);
    await apiClient.reorderPageSections(token, pageId, reordered.map((s, i) => ({ id: s.id, sort_order: i })));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Page Sections</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sections.map((section) => (
                <SortableSection key={section.id} section={section} onUpdate={updateSection} onDelete={deleteSection} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex items-end gap-3 rounded-lg border border-dashed border-zinc-200 p-4">
          <div className="space-y-2">
            <Label>Component</Label>
            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="flex h-10 rounded-lg border border-zinc-200 px-3 text-sm">
              {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <Button type="button" onClick={addSection}><Plus className="mr-2 h-4 w-4" />Add Section</Button>
        </div>
      </CardContent>
    </Card>
  );
}
