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
import { SectionContentEditor } from "@/components/cms/section-content-editor";
import { SectionTypeBadge } from "@/components/cms/cms-page-view";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SECTION_TYPES } from "@/lib/api";
import { isSectionType } from "@/lib/cms-sections";
import { createHomepageSection, type HomepageSection } from "@/lib/homepage-meta";
import { cn } from "@/lib/utils";

function SortableHomepageSection({
  section,
  onUpdate,
  onDelete,
}: {
  section: HomepageSection;
  onUpdate: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const sectionType = isSectionType(section.component_type) ? section.component_type : "text";

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-app-border bg-app-surface p-5 ring-1 ring-app-border">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-app-border/60 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="cursor-grab shrink-0 text-app-muted hover:text-accent-soft" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5" />
          </button>
          <SectionTypeBadge type={section.component_type} />
        </div>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => onDelete(section.id)}>
          <Trash2 className="h-4 w-4 text-status-error" />
        </Button>
      </div>
      <SectionContentEditor
        type={sectionType}
        content={section.content}
        onChange={(content) => onUpdate(section.id, content)}
      />
    </div>
  );
}

export function HomepageSectionsEditor({
  sections,
  onChange,
}: {
  sections: HomepageSection[];
  onChange: (sections: HomepageSection[]) => void;
}) {
  const [newType, setNewType] = useState("text");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addSection = () => {
    const type = isSectionType(newType) ? newType : "text";
    const next = [...sections, { ...createHomepageSection(type), sort_order: sections.length }];
    onChange(next);
  };

  const updateSection = (id: string, content: Record<string, unknown>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, content } : s)));
  };

  const deleteSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, sort_order: i })));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    onChange(arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, sort_order: i })));
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className={cn("space-y-4", sections.length === 0 && "hidden")}>
            {sections.map((section) => (
              <SortableHomepageSection
                key={section.id}
                section={section}
                onUpdate={updateSection}
                onDelete={deleteSection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <p className="rounded-xl border border-dashed border-app-border bg-app-surface/40 px-4 py-6 text-center text-sm text-app-muted">
          No extra sections yet. Add banners, galleries, FAQs, and more below the features block.
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-app-border bg-app-surface/60 p-5 ring-1 ring-app-border sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 form-field">
          <Label>Section type</Label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="form-select flex h-10 w-full rounded-lg border border-app-border bg-app-surface-muted/60 px-3 text-sm text-app-text sm:max-w-xs"
          >
            {SECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <Button type="button" className="w-full shrink-0 sm:w-auto" onClick={addSection}>
          <Plus className="h-4 w-4" />
          Add section
        </Button>
      </div>
    </div>
  );
}
